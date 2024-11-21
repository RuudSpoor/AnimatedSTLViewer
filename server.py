from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl

IP = "127.0.0.1"
PORT = 443

httpd = HTTPServer((IP, PORT), SimpleHTTPRequestHandler)
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(
        certfile="/home/ruud/Documents/PythonWorkspace/https_servers/certificate.pem",
        keyfile="/home/ruud/Documents/PythonWorkspace/https_servers/private.key"
)

httpd.socket = context.wrap_socket (httpd.socket, server_side=True)

print(f"Start server on https://{IP}:{PORT}")
httpd.serve_forever()
