/* Para esta actividad construiremos un API HTTP en node utilizando la librería express.js.
El API debe incluir las rutas necesarias para generar una respuesta en formato JSON a los siguientes puntos
*/

const express = require("express");
const app = express();

const data = require("./employees.json");

app.use(express.json());

// Actividad 1, Actividad 2, Actividad 3 y Actividad 5

app.get("/api/employees", (req, res) =>{
    const page = req.query.page;
    const perPage = 2;

    const user = req.query.user;

    const badgeColor = req.query.badges;

    if (page != null){
        // Actividades 2 y 3
        const pageData = pagedData (page,perPage);
        res.status(206).json(pageData);
    } else if (user == "true"){
        // Actividad 5
        const users = validateUsers ();
        res.status(206).json(users);
    } else if (badgeColor != null) {
        // Actividad 7
        const badgeMatches = matchesBadgeColor(badgeColor);
        if (badgeMatches.length >= 1) {
            res.status(206).json(badgeMatches);
        } else {
            res.status(204).json({message:'There are no employees with a ${badgeColor} badge'});
        }
    } else {
        // Actividad 1
        res.status(200).json(data);
    }
});

/* Actividades 2 y 3
Uso la función pagedData para:
    -Pasar cuantos items debe haber por página y que página solicta el user
    -Calcular en base al número de items por página, ver donde inicia y donde acaba la query del user
    -Devolver los datos filtrados para la página específica
*/

function pagedData (page,perPage) {
    const dataStart = (page -1) * perPage;
    const dataEnd = dataStart + perPage;
    return data.slice(dataStart,dataEnd);
}

/* Actividad 4
Extraigo las edades a un array para luego poderlas comparar en un bucle for
Cada vez que se identifica una nueva edad más alta, registramos también en que posición del array se produce
Finalmente referenciamos en el dataset orginal a esa posición para extraer el objeto completo
*/

app.get("/api/employees/oldest", (req, res) =>{
    const ages = data.map(data => data.age);
    let maxAge = ages[0];
    for (let i = 1; i < ages.length; i++) {
        if (ages[i] > maxAge) {
            maxAge = ages[i];
            personId = i; 
        }
    }
    const oldestEmployee = data[personId];
    res.status(200).json(oldestEmployee);
});

/* Actividad 5
Uso la función validateUsers para verificar que entre los empleados cuales son users
    -Si para el data[i] el privilege es user entonces almaceno ese objeto entero en el nuevo array de usuarios
*/
function validateUsers (){
    let validatedUsers = [];

    for (let i = 0; i < data.length; i++) {
        if (data[i].privileges === "user"){
            validatedUsers.push(data[i]);
        }
    }
    return validatedUsers;
}

/* Actividad 6
Uso una función para comparar la estructura de los dos jsons y así validar si la entrada de datos es correcta:
    -Primero que en ambos casos sean objetos
    -Que la longitud de atributos sea la misma
    -Que estos atributos coincidan en nombre
    -Los tipos de estos atributos también deben ser iguales
    -Incluso a su vez, validar que si un atributo es un objeto, le aplico la misma lógica de comparación anidada

Una vez he validado esto, solo tengo que hacer push de los nuevos datos a los que ya tenía e imprimir mensaje de éxito/error
*/

function compareJSONStructure(json1, json2) {
    if (typeof json1 !== 'object' || typeof json2 !== 'object') {
        return false;
    }

    if (Object.keys(json1).length !== Object.keys(json2).length) {
        return false;
    }

    for (let key in json1) {
        if (!(key in json2)) {
            return false;
        }

        if (typeof json1[key] !== typeof json2[key]) {
            return false;
        }

        if (typeof json1[key] === 'object') {
            if (!compareJSONStructure(json1[key], json2[key])) {
                return false;
            }
        }
    }
    return true;
}

app.post("/api/employees", (req, res) => {
    let newData = req.body;
    const dataSchema = data[0];
    if (compareJSONStructure(dataSchema, newData)) {
        data.push(newData);
        res.status(201).json({message: 'Employee entry was successfull. Your data is now: ${data}'});
    } else {
        res.status(400).json({"code": "bad_request"});
    }
});

/* Actividad 7
Uso la función de debajo para contrastar que el usuario, entre alguna de sus badges tiene una negra
    -Anido una función con un forEach para recorrer todo el objeto de data
    -Después compruebo que el atributo badges contenga al menos 1 que sea como la que pide el usuario al pasar el parámetro "badges"
    -Funcionaría si el usuario intentase usar otro color también
*/
function matchesBadgeColor (specificColor){
    let rightBadge = [];

    data.forEach(obj => {
        if (obj.badges.includes(specificColor)) {
          rightBadge.push(obj);
        }
      });
    return rightBadge;
}

/* Actividad 8
Usando el endpoint abierto para que el usuario pueda pasar parte de la ruta como parámetro tenemos lo siguiente:
    -El forEach de nuevo para mappear los empleados con el nombre contribuido
    -Por si acaso devolvemos siempre array de objetos por si hubiera multiples coincidencias
    -Usamos la validación de que el array venga llena con resultados para ver si devolvemos un código de status u otro
*/
app.get("/api/employees/:name", (req, res) =>{
    const name = req.params.name;
    const employeesNamed = matchingNames (name);
    if (employeesNamed.length >= 1){
        res.status(206).json(employeesNamed);
    } else {
        res.status(404).json({"code": "not_found"});
    }
});

function matchingNames (name) {
    let rightName= [];
    data.forEach (obj => {
        if (obj.name === name) {
            rightName.push(obj);
        }
    });
    return rightName;
}

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});