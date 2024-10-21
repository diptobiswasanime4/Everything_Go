package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/smtp"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/rs/cors"
)

type Todo struct {
	Id string `json:"id"`
	Task string `json:"task"`
	Completed bool `json:"completed"`
}

type User struct {
	Email string `json:"email"`
	Password string `json:"password"`
}

type HealthResponse struct {
	Status string `json:"status"`
	Message string `json:"message"`
}

type OTPResponse struct {
	OTP int `json:"OTP"`
}

var (
	todos []Todo
	todoMutex sync.Mutex

	users []User
	userMutex sync.Mutex
)

func generateRandomId() string {
	return uuid.New().String()
}

func healthHandler (w http.ResponseWriter, r *http.Request) {
	health := HealthResponse {
		Status: "Ok",
		Message: "API health is ok ok",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(health)
}

func todosHandler (w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(todos)
	case "POST":
		var newTodo Todo
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Unable to read request body", http.StatusBadRequest)
			return
		}

		err = json.Unmarshal(body, &newTodo)
		if err != nil || newTodo.Task == "" {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		newTodo.Id = generateRandomId()

		todoMutex.Lock()
		todos = append(todos, newTodo)
		todoMutex.Unlock()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newTodo)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func todoByIdHandler (w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/todos/"):]

	todoMutex.Lock()
	defer todoMutex.Unlock()

	for i, todo := range todos {
		if todo.Id == id {
			switch r.Method {
			case "GET":
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(todo)
			case "PUT":
				var updatedTodo Todo
				body, err := ioutil.ReadAll(r.Body)
				if err != nil {
					http.Error(w, "Unable to read request body", http.StatusBadRequest)
					return
				}

				err = json.Unmarshal(body, &updatedTodo)
				if err != nil || updatedTodo.Task == "" {
					http.Error(w, "Invalid update", http.StatusBadRequest)
					return
				}

				todos[i].Task = updatedTodo.Task
				todos[i].Completed = updatedTodo.Completed

				json.NewEncoder(w).Encode(todos[i])

			case "DELETE":
				deletedTodoId := todo.Id
				todos = append(todos[:i], todos[i+1:]...)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]string{"message": "Todo with Id " + deletedTodoId + " successfully deleted"})
			default:
				http.Error(w, "Method not allowed", http.StatusBadRequest)
			}
		}
	}
}

func registerHandler (w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	case "POST":
		var newUser User
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Unable to read from req body", http.StatusBadRequest)
			return
		}

		err = json.Unmarshal(body, &newUser)
		fmt.Println(newUser)
		if err != nil || newUser.Email == "" || newUser.Password == "" {
			http.Error(w, "Invalid Input", http.StatusBadRequest)
			return
		}

		userMutex.Lock()
		users = append(users, newUser)
		userMutex.Unlock()

		verifyUrl := "/verify?email=" + newUser.Email
		http.Redirect(w, r, verifyUrl, http.StatusSeeOther)

	default:
		http.Error(w, "Invalid method", http.StatusBadRequest)
	}
}

func verifyHandler(w http.ResponseWriter, r *http.Request) {
	emailResp := HealthResponse {
		Status: "Ok",
		Message: "Please verify account",
	}
	
	query := r.URL.Query()
	email := query.Get("email")

	var otpGenerated int

	fmt.Println(r.Method)
	
	switch r.Method {
	case "GET":
		if email != "" {
			otpGenerated = sendOTP(email)
			if otpGenerated == 0 {
				http.Error(w, "Failed to send Email", http.StatusBadRequest)
				return
			}
			fmt.Println(otpGenerated)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(emailResp)
		} else {
			http.Error(w, "Email not provided", http.StatusBadRequest)
		}
	case "POST":
		var otpBody OTPResponse
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Unable to read OTP", http.StatusBadRequest)
			return
		}
		err = json.Unmarshal(body, &otpBody)
		if err != nil {
			http.Error(w, "Invalid OTP", http.StatusBadRequest)
			return
		}
		fmt.Println(otpBody.OTP)
		fmt.Println(otpGenerated)

		if otpBody.OTP == otpGenerated {
			fmt.Println("Yes")
			successResp := HealthResponse {
				Status: "Ok",
				Message: "Account verified successfully!",
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(successResp)
		} else {
			http.Error(w, "Invalid OTP", http.StatusUnauthorized)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(otpBody)
	default:

	}
}

func sendOTP(to string) int {
	from := "diptobiswasgpt4@gmail.com"
	password := "mqio bunc ivmh fmtg"
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	rand.Seed(time.Now().UnixNano())
	otp := rand.Intn(1000000)

	msg := []byte(fmt.Sprintf("Subject: Verification Email\n\nPlease verify your email address with this OTP %06d", otp))
	auth := smtp.PlainAuth("", from, password, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)

	if err != nil {
		fmt.Println("Failed to send email:", err)
		return 0
	}

	fmt.Println("Email sent successfully to:", to)
	return otp
}

func loginHandler (w http.ResponseWriter, r *http.Request) {
	var loginInfo User
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read from body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &loginInfo)
	if err != nil || loginInfo.Email == "" || loginInfo.Password == "" {
		http.Error(w, "Invalid login info", http.StatusBadRequest)
		return
	}

	for _, user := range users {
		if user.Email == loginInfo.Email {
			if user.Password == loginInfo.Password {
				UserResp := HealthResponse {
					Status: "Ok",
					Message: "Login successful",
				}
			
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(UserResp)
				return
			} else {
				wrongPasswordResp := HealthResponse {
					Status: "Not Ok",
					Message: "Wrong password",
				}
			
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(wrongPasswordResp)
				return
			}
		}
	}	
	noUserResp := HealthResponse {
		Status: "Not Ok",
		Message: "User not found",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(noUserResp)
}

func main () {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/todos", todosHandler)
	mux.HandleFunc("/todos/", todoByIdHandler)
	mux.HandleFunc("/register", registerHandler)
	mux.HandleFunc("/login", loginHandler)
	mux.HandleFunc("/verify", verifyHandler)

	fmt.Println("App is running on PORT 3000")

	corsOptions := cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	}

	handler := cors.New(corsOptions).Handler(mux)
	err := http.ListenAndServe(":3000", handler)

	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}