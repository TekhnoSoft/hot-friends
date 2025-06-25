const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const router = express.Router();

const { validateOrigin } = require('../middlewares/CorsMiddleware');
const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');

router.get('/auth', validateToken, async (req, res) => {
    try {
        return res.status(200).json({ message: "Token válido", data: req.user.id });
    } catch (err) {
        return res.status(401).json({ message: "Erro ao recuperar o token", data: null });
    }
});

// Rota de login
router.post('/login', validateOrigin, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }
    try {
        // Busca usuário pelo email
        const result = await db.query('SELECT * FROM Users WHERE email = @param0', [email]);
        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
        // Verifica senha
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
        // Gera token JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

// Rota de cadastro
router.post('/register', validateOrigin, async (req, res) => {
    const { username, email, password, acceptTerms } = req.body;
    if (!username || !email || !password || !acceptTerms) {
        return res.status(400).json({ success: false, message: 'Username, email, senha e aceite dos termos são obrigatórios.' });
    }
    try {
        // Verifica se o email já existe
        const existingEmail = await db.query('SELECT id FROM Users WHERE email = @param0', [email]);
        if (existingEmail.recordset.length > 0) {
            return res.status(409).json({ success: false, message: 'Email já cadastrado.' });
        }
        // Verifica se o username já existe
        const existingUsername = await db.query('SELECT id FROM Users WHERE username = @param0', [username]);
        if (existingUsername.recordset.length > 0) {
            return res.status(409).json({ success: false, message: 'Username já cadastrado.' });
        }
        // Hash da senha
        const password_hash = await bcrypt.hash(password, 10);
        // Insere usuário
        await db.query(
            'INSERT INTO Users (id, username, email, password_hash) VALUES (NEWID(), @param0, @param1, @param2)',
            [username, email, password_hash]
        );
        return res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

// Rota de login/cadastro com Google
router.post('/google', validateOrigin, async (req, res) => {
    const { email, username, password, googleToken } = req.body;
    if (!email || !googleToken) {
        return res.status(400).json({ success: false, message: 'Email e token do Google são obrigatórios.' });
    }
    try {
        // Verifica se o token do Google é válido (simples, para produção use a API do Google)
        // Aqui apenas checamos se veio algo, mas o ideal é validar o token com a Google API
        if (!googleToken) {
            return res.status(401).json({ success: false, message: 'Token do Google inválido.' });
        }
        // Verifica se o usuário já existe
        const existing = await db.query('SELECT * FROM Users WHERE email = @param0', [email]);
        let user = existing.recordset[0];
        if (user) {
            // Usuário já existe, faz login normal
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        } else {
            // Novo usuário: precisa de username e senha
            if (!username || !password) {
                return res.status(400).json({ success: false, needPassword: true, message: 'Usuário novo, defina username e senha.' });
            }
            // Verifica se username já existe
            const existingUsername = await db.query('SELECT id FROM Users WHERE username = @param0', [username]);
            if (existingUsername.recordset.length > 0) {
                return res.status(409).json({ success: false, message: 'Username já cadastrado.' });
            }
            const password_hash = await bcrypt.hash(password, 10);
            await db.query('INSERT INTO Users (id, username, email, password_hash) VALUES (NEWID(), @param0, @param1, @param2)', [username, email, password_hash]);
            // Busca o usuário recém-criado
            const created = await db.query('SELECT * FROM Users WHERE email = @param0', [email]);
            user = created.recordset[0];
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

module.exports = router;