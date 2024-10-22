package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	resp := map[string]string {
		"status": "ok",
		"message": "API health is ok ok",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(resp)
}

func todoHandler(w http.ResponseWriter, r *http.Request) {

}

func main () {
	http.HandleFunc("/health", healthHandler)

	http.ListenAndServe(":3000", nil)

	fmt.Println("Hello World")
}