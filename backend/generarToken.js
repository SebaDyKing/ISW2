import jwt from "jsonwebtoken";

const token = jwt.sign(
    { id: 1, entity: "admin" },
    "clave_temporal",
    { expiresIn: "1d" }
);

console.log(token);