https://github.com/Kemi-Stry/Practices-Management-System


auth
```typescript
app.post("/auth/login", async (req: Request, res: Response) => {
    try {
        //get data from request body
        const username = req.body.username as string;
        const password = req.body.password as string;
        //query database
        const user = await db.searchUser(username);
        //check if user exist
        if (user === "notfound") {
            res.sendStatus(404);
            return;
        }
        //compare password with hashed password in db
        if (await comparePassword(password, user.userPassword) === false) {
            res.sendStatus(404);
            return;
        }
        const payload: jwtPayload = { "id": user.id, "role": user.userRole }; // data to serialize
        const token = jsonwebtoken.sign(payload, jwtSecret); // signing web token
        res.json({
            "token": token,
            "id": user.id,
            "role": user.userRole
        }).status(200); // send response
    }
    catch {
        res.sendStatus(500);
    }
})
```
