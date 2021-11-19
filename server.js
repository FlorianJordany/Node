const http = require("http");
const fs = require("fs");
var dayjs = require("dayjs");
require("dayjs/locale/fr");
require("dotenv").config();

const { students } = require("./Data/Students");
const { formatDate } = require("./utils");

formatDate(students);

/* let students = [
  { name: "Sonia", birth: "2019-14-05" },
  { name: "Antoine", birth: "2000-12-05" },
  { name: "Alice", birth: "1990-14-09" },
  { name: "Sophie", birth: "2001-10-02" },
  { name: "Bernard", birth: "1980-21-08" },
]; */

http
  .createServer((req, res) => {
    const url = req.url.replace("/", "");

    if (url === "favicon.ico") {
      //console.log('favicon')
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end();
      return;
    }
    // traiter la requete bootstrap venant du navigateur(balise link)
    if (url === "bootstrap") {
      res.writeHead(200, { "Content-Type": "text/css" });
      const css = fs.readFileSync("./assets/css/bootstrap.min.css");
      res.write(css);
      res.end();
      return;
    }

    if (url === "") {
      const home = fs.readFileSync("./view/home.html");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write(home);
      res.end();
    }

    if (url === "users") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      let users = "";
      for (let i = 0; i < students.length; i++) {
        users += `<li>${students[i].name} ${students[i].birth} <form action="" method="post">
        <button name="deleteUser" value="${i}" class="btn btn-primary">DELETE</button>
    </form> </li>`;
      }
      res.end(`
                        <h1>Tous les etudiants</h1>
                        <ul>
                            ${users} 
                        </ul>
                        <p><a href="http://127.0.0.1:3000">Home</a></p>
                        <p><a href="http://127.0.0.1:3000/users">Refresh</a><p>
                        `);
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (data) => {
        body += data;
      });

      req.on("end", () => {
        if (req.url === "/users") {
          const split = body.toString().split("&");
          const deleteUser = split[0].split("=").pop();
          if (deleteUser) {
            students.splice(deleteUser, 1);
          }
          res.writeHead(301, { Location: `http://127.0.0.1:3000/users` });
          res.end();
        } else {
          const split = body.toString().split("&");
          const name = split[0].split("=").pop();
          const date = split[1].split("=").pop();
          if (name) {
            students.push({
              name: name,
              birth: dayjs(date).locale("fr").format("dddd D MMMM YYYY"),
            });
          }
          res.writeHead(301, { Location: `http://127.0.0.1:3000` });
          res.end();
        }
      });
    }
  })
  .listen(process.env.APP_PORT);
console.log("Server running at http://127.0.0.1:3000");
