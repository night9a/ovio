// go_server.go
package main

import (
    "bufio"
    "fmt"
    "net"
    "os"
    "strings"
)

const dbFile = "users.db"

func insert(username, password string) string {
    f, _ := os.OpenFile(dbFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    defer f.Close()
    f.WriteString(username + "|" + password + "\n")
    return "OK"
}

func lookup(username string) string {
    f, _ := os.Open(dbFile)
    defer f.Close()
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        line := scanner.Text()
        parts := strings.Split(line, "|")
        if parts[0] == username {
            return parts[1]
        }
    }
    return "NOT_FOUND"
}

func handleConnection(conn net.Conn) {
    defer conn.Close()
    reader := bufio.NewReader(conn)
    line, _ := reader.ReadString('\n')
    line = strings.TrimSpace(line)
    parts := strings.Split(line, " ")
    if len(parts) < 1 {
        conn.Write([]byte("ERROR\n"))
        return
    }
    cmd := parts[0]
    res := "ERROR"
    if cmd == "INSERT" && len(parts) == 3 {
        res = insert(parts[1], parts[2])
    } else if cmd == "LOOKUP" && len(parts) == 2 {
        res = lookup(parts[1])
    }
    conn.Write([]byte(res + "\n"))
}

func main() {
    ln, _ := net.Listen("tcp", ":12347")
    fmt.Println("Go DB server listening on port 12347...")
    for {
        conn, _ := ln.Accept()
        go handleConnection(conn)
    }
}
