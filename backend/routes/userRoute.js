const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { validateOrigin } = require('../middlewares/CorsMiddleware');
const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');

// Função para determinar o caminho da pasta de upload
function getUploadPath() {
    const isWindows = os.platform() === 'win32';
    const rootPath = isWindows ? 'C:\\' : '/';
    const uploadPath = path.join(rootPath, 'upload');
    
    // Cria o diretório se não existir
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    return uploadPath;
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = getUploadPath();
        console.log('Upload path:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const userId = req.user.id;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de arquivo não suportado. Use apenas JPG, PNG ou GIF.'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

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
            'INSERT INTO Users (id, username, email, password_hash, role) VALUES (NEWID(), @param0, @param1, @param2, @param3)',
            [username, email, password_hash, 'user']
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

// Rota para retornar dados do usuário autenticado
router.get('/get', validateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT id, name, username, email, bio, location, website, avatar, cover_image as coverImage, role FROM Users WHERE id = @param0', 
            [userId]
        );
        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar usuário.' });
    }
});

// Rota para atualizar perfil
router.put('/update', validateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, username, bio, location, website, avatar, coverImage } = req.body;

        // Verifica se o username já existe (se foi alterado)
        if (username) {
            const existingUsername = await db.query(
                'SELECT id FROM Users WHERE username = @param0 AND id != @param1',
                [username, userId]
            );
            if (existingUsername.recordset.length > 0) {
                return res.status(409).json({ success: false, message: 'Username já está em uso.' });
            }
        }

        // Constrói a query de atualização dinamicamente
        let updateFields = [];
        let params = [];
        let paramIndex = 0;

        if (name) {
            updateFields.push(`name = @param${paramIndex}`);
            params.push(name);
            paramIndex++;
        }
        if (username) {
            updateFields.push(`username = @param${paramIndex}`);
            params.push(username);
            paramIndex++;
        }
        if (bio !== undefined) {
            updateFields.push(`bio = @param${paramIndex}`);
            params.push(bio);
            paramIndex++;
        }
        if (location !== undefined) {
            updateFields.push(`location = @param${paramIndex}`);
            params.push(location);
            paramIndex++;
        }
        if (website !== undefined) {
            updateFields.push(`website = @param${paramIndex}`);
            params.push(website);
            paramIndex++;
        }
        if (avatar) {
            updateFields.push(`avatar = @param${paramIndex}`);
            params.push(avatar);
            paramIndex++;
        }
        if (coverImage) {
            updateFields.push(`cover_image = @param${paramIndex}`);
            params.push(coverImage);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar.' });
        }

        // Adiciona o userId como último parâmetro
        params.push(userId);

        const query = `
            UPDATE Users 
            SET ${updateFields.join(', ')}
            WHERE id = @param${paramIndex};
            
            SELECT id, name, username, email, bio, location, website, avatar, cover_image as coverImage, role 
            FROM Users 
            WHERE id = @param${paramIndex};
        `;

        const result = await db.query(query, params);
        const updatedUser = result.recordset[0];

        return res.status(200).json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso.',
            data: updatedUser
        });
    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar perfil.' });
    }
});

// Rota para upload de arquivos
router.post('/upload', validateToken, (req, res) => {
    upload.single('file')(req, res, function(err) {
        if (err) {
            console.error('Erro no upload:', err);
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado.' });
        }

        // Verifica se o tipo está correto
        const type = req.body && req.body.type ? req.body.type.toLowerCase() : '';
        if (!['avatar', 'cover'].includes(type)) {
            // Remove o arquivo se foi salvo
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ 
                success: false, 
                message: 'Tipo de upload inválido. Use "avatar" ou "cover".'
            });
        }

        console.log('Upload concluído:', {
            type: type,
            body: req.body,
            file: req.file
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Upload realizado com sucesso.',
            filename: req.file.filename
        });
    });
});

// Rota para servir imagens
router.get('/image/:type/:filename', async (req, res) => {
    try {
        const { type, filename } = req.params;
        const imagePath = path.join(__dirname, '..', 'upload', type, filename);

        // Verifica se o arquivo existe
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ success: false, message: 'Imagem não encontrada.' });
        }

        // Define o tipo de conteúdo baseado na extensão do arquivo
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        };
        
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
        
        // Envia o arquivo
        res.sendFile(imagePath);
    } catch (err) {
        console.error('Erro ao servir imagem:', err);
        res.status(500).json({ success: false, message: 'Erro ao carregar imagem.' });
    }
});

module.exports = router;