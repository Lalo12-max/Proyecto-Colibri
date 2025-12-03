

import request from "supertest";
import app from "../app.js";

describe("Pruebas de Integración API", () => {

    // Probar que la API está activa (endpoint /health)
    test("GET /health debe responder {status: 'ok'}", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("status", "ok");
    });

    // Probar login de usuario (estructura válida)
    test("POST /auth/login debe responder 400 o 401 si faltan datos", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "",      // datos vacíos para forzar error controlado
                password: ""
            });

        expect([400, 401]).toContain(res.statusCode);
    });

    // Probar creación de solicitud (debe validar body)
    test("POST /solicitudes debe responder 400 si faltan datos", async () => {
        const res = await request(app)
            .post("/solicitudes")
            .send({}); // body vacío

        expect([400, 401]).toContain(res.statusCode);
    });

});
