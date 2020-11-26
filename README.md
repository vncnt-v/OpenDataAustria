# OpenDataAustria

### Front-End
##### SetUp
```sh
cd Front-End
ng serve --open
```

### Back-End
##### SetUp
```sh
cd Back-End
npm install
npm start
```
##### Test
```sh
// Map Koordinaten
curl -X GET http://localhost:8000/map
// Corona Daten
curl -X GET http://localhost:8000/corona
```

### Prototyp
##### SetUp
- use Visual Studio Code
    - open folder with VSC
    - install extension Live Server
    - right click on index.html -> "Open with Live Server"
- use XAMPP
    - copy prototyp folder to htdocs
    - open http://localhost:8080/Prototyp/
