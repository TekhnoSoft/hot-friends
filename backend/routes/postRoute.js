const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const { validateToken} = require('../middlewares/AuthMiddleware');
const db = require('../database');
const os = require('os');
const fs = require('fs');

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
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uuidv4() + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

    if (file.fieldname === 'file') {
        const type = file.mimetype.split('/')[0]; // 'image', 'video', ou 'audio'
        
        if (type === 'image' && allowedImageTypes.includes(file.mimetype)) {
            req.fileType = 'image';
            cb(null, true);
        } else if (type === 'video' && allowedVideoTypes.includes(file.mimetype)) {
            req.fileType = 'video';
            cb(null, true);
        } else if (type === 'audio' && allowedAudioTypes.includes(file.mimetype)) {
            req.fileType = 'audio';
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado!'), false);
        }
    } else {
        cb(new Error('Campo de arquivo inválido!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// Upload de mídia para posts
router.post('/upload', validateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo enviado'
            });
        }

        res.json({
            success: true,
            message: 'Arquivo enviado com sucesso',
            filename: req.file.filename,
            type: req.fileType
        });
    } catch (error) {
        console.error('Erro no upload de mídia:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no upload de mídia',
            error: error.message
        });
    }
});

// Servir arquivos de mídia
router.get('/media/:filename', (req, res) => {
    const { filename } = req.params;
    const isWindows = os.platform() === 'win32';
    console.log(isWindows);
    const filePath = isWindows 
        ? path.join('C:\\', 'upload', filename)
        : path.join('/etc/easypanel/projects/hot-friends/hotfriends-backend/volumes/upload', filename);
    res.sendFile(filePath);
});

// Criar um novo post
router.post('/', validateToken, async (req, res) => {
    const {
        content,
        mediaType,
        mediaUrl,
        isTemporary,
        expirationDate,
        scheduledDate,
        allowComments,
        isPaid,
        price,
        postType,
        pollOptions,
        pollEndDate,
        quizQuestions,
        quizEndDate,
        challengeDescription,
        challengeEndDate,
        challengeReward
    } = req.body;

    try {
        // Validações básicas
        if (!content && !mediaUrl) {
            return res.status(400).json({
                success: false,
                message: 'O post precisa ter conteúdo ou mídia'
            });
        }

        if (isPaid && (!price || price <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Posts pagos precisam ter um preço válido'
            });
        }

        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .input('content', sql.NVarChar(sql.MAX), content)
            .input('mediaType', sql.VarChar(20), mediaType)
            .input('mediaUrl', sql.VarChar(500), mediaUrl)
            .input('isTemporary', sql.Bit, isTemporary)
            .input('expirationDate', sql.DateTime, expirationDate)
            .input('scheduledDate', sql.DateTime, scheduledDate)
            .input('allowComments', sql.Bit, allowComments)
            .input('isPaid', sql.Bit, isPaid)
            .input('price', sql.Decimal(10, 2), price)
            .input('postType', sql.VarChar(20), postType)
            .input('pollOptions', sql.NVarChar(sql.MAX), pollOptions ? JSON.stringify(pollOptions) : null)
            .input('pollEndDate', sql.DateTime, pollEndDate)
            .input('quizQuestions', sql.NVarChar(sql.MAX), quizQuestions ? JSON.stringify(quizQuestions) : null)
            .input('quizEndDate', sql.DateTime, quizEndDate)
            .input('challengeDescription', sql.Text, challengeDescription)
            .input('challengeEndDate', sql.DateTime, challengeEndDate)
            .input('challengeReward', sql.Text, challengeReward)
            .query(`
                INSERT INTO Posts (
                    user_id, content, media_type, media_url,
                    is_temporary, expiration_date, scheduled_date,
                    allow_comments, is_paid, price, post_type,
                    poll_options, poll_end_date,
                    quiz_questions, quiz_end_date,
                    challenge_description, challenge_end_date, challenge_reward,
                    created_at
                )
                VALUES (
                    @userId, @content, @mediaType, @mediaUrl,
                    @isTemporary, @expirationDate, @scheduledDate,
                    @allowComments, @isPaid, @price, @postType,
                    @pollOptions, @pollEndDate,
                    @quizQuestions, @quizEndDate,
                    @challengeDescription, @challengeEndDate, @challengeReward,
                    GETDATE()
                );
                SELECT SCOPE_IDENTITY() AS id;
            `);

        res.json({
            success: true,
            message: 'Post criado com sucesso!',
            postId: result.recordset[0].id
        });
    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar post',
            error: error.message
        });
    }
});

// Buscar posts do feed
router.get('/feed/:page/:limit', validateToken, async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .input('currentDate', sql.DateTime, new Date())
            .query(`
                SELECT 
                    p.*,
                    u.username,
                    u.avatar,
                    CASE WHEN p.user_id = @userId THEN 1 ELSE 0 END as is_owner,
                    (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) as comments_count,
                    (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as likes_count,
                    (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = @userId) as is_liked,
                    (SELECT COUNT(*) FROM SavedPosts WHERE post_id = p.id AND user_id = @userId) as is_saved
                FROM Posts p
                INNER JOIN Users u ON p.user_id = u.id
                WHERE (p.scheduled_date IS NULL OR p.scheduled_date <= @currentDate)
                AND (p.expiration_date IS NULL OR p.expiration_date > @currentDate)
                AND p.deleted_at IS NULL
                ORDER BY p.created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY;
                
                SELECT COUNT(*) as total
                FROM Posts p
                WHERE (p.scheduled_date IS NULL OR p.scheduled_date <= @currentDate)
                AND (p.expiration_date IS NULL OR p.expiration_date > @currentDate)
                AND p.deleted_at IS NULL;
            `);

        const posts = result.recordsets[0];
        const total = result.recordsets[1][0].total;

        res.json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao buscar feed:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar feed',
            error: error.message
        });
    }
});

// Votar em uma enquete
router.post('/:postId/vote', validateToken, async (req, res) => {
    const { postId } = req.params;
    const { optionIndex } = req.body;

    try {
        const pool = await sql.connect();
        
        // Verificar se o usuário já votou
        const checkVote = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .query('SELECT id FROM PollVotes WHERE post_id = @postId AND user_id = @userId');

        if (checkVote.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Você já votou nesta enquete'
            });
        }

        // Registrar o voto
        await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .input('optionIndex', sql.Int, optionIndex)
            .query(`
                INSERT INTO PollVotes (post_id, user_id, option_index)
                VALUES (@postId, @userId, @optionIndex)
            `);

        res.json({
            success: true,
            message: 'Voto registrado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao votar:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registrar voto',
            error: error.message
        });
    }
});

// Responder um questionário
router.post('/:postId/quiz', validateToken, async (req, res) => {
    const { postId } = req.params;
    const { responses } = req.body;

    try {
        const pool = await sql.connect();
        
        // Verificar se o usuário já respondeu
        const checkResponse = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .query('SELECT id FROM QuizResponses WHERE post_id = @postId AND user_id = @userId');

        if (checkResponse.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Você já respondeu este questionário'
            });
        }

        // Buscar as respostas corretas
        const post = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query('SELECT quiz_questions FROM Posts WHERE id = @postId');

        const quizQuestions = JSON.parse(post.recordset[0].quiz_questions);
        
        // Calcular pontuação
        let score = 0;
        responses.forEach((response, index) => {
            if (response === quizQuestions[index].correctOption) {
                score++;
            }
        });

        // Registrar resposta
        await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .input('responses', sql.NVarChar(sql.MAX), JSON.stringify(responses))
            .input('score', sql.Int, score)
            .query(`
                INSERT INTO QuizResponses (post_id, user_id, responses, score)
                VALUES (@postId, @userId, @responses, @score)
            `);

        res.json({
            success: true,
            message: 'Respostas registradas com sucesso!',
            score
        });
    } catch (error) {
        console.error('Erro ao responder questionário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registrar respostas',
            error: error.message
        });
    }
});

// Participar de um desafio
router.post('/:postId/challenge', validateToken, upload.single('media'), async (req, res) => {
    const { postId } = req.params;
    const { submissionText } = req.body;
    const mediaUrl = req.file ? req.file.filename : null;

    try {
        const pool = await sql.connect();
        
        // Verificar se o desafio ainda está ativo
        const challenge = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('currentDate', sql.DateTime, new Date())
            .query(`
                SELECT id FROM Posts 
                WHERE id = @postId 
                AND post_type = 'challenge'
                AND (challenge_end_date IS NULL OR challenge_end_date > @currentDate)
            `);

        if (challenge.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Este desafio não está mais ativo'
            });
        }

        // Registrar participação
        await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .input('submissionText', sql.Text, submissionText)
            .input('mediaUrl', sql.VarChar(500), mediaUrl)
            .query(`
                INSERT INTO ChallengeParticipations (post_id, user_id, submission_text, submission_media_url)
                VALUES (@postId, @userId, @submissionText, @mediaUrl)
            `);

        res.json({
            success: true,
            message: 'Participação registrada com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao participar do desafio:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registrar participação',
            error: error.message
        });
    }
});

// Adicionar comentário a um post
router.post('/:postId/comments', validateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
    }

    // Verifica se o post existe
    const pool = await sql.connect();
    const postResult = await pool.request()
      .input('postId', sql.UniqueIdentifier, postId)
      .query('SELECT id FROM Posts WHERE id = @postId');

    if (!postResult.recordset.length) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Insere o comentário usando NVARCHAR para suporte a emoji
    const result = await pool.request()
      .input('postId', sql.UniqueIdentifier, postId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('content', sql.NVarChar(sql.MAX), content)
      .query(`
        INSERT INTO Comments (post_id, user_id, content)
        OUTPUT INSERTED.*
        VALUES (@postId, @userId, @content)
      `);

    // Busca o comentário com informações do usuário
    const commentResult = await pool.request()
      .input('commentId', sql.UniqueIdentifier, result.recordset[0].id)
      .query(`
        SELECT 
          c.*,
          u.username,
          u.avatar
        FROM Comments c
        JOIN Users u ON u.id = c.user_id
        WHERE c.id = @commentId
      `);

    res.status(201).json(commentResult.recordset[0]);
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

// Listar comentários de um post
router.get('/:postId/comments', validateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const pool = await sql.connect();

    // Busca os comentários com informações dos usuários
    const commentsResult = await pool.request()
      .input('postId', sql.UniqueIdentifier, postId)
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, Number(limit))
      .query(`
        SELECT 
          c.id,
          c.content,
          c.created_at,
          c.user_id,
          u.username,
          u.avatar,
          CASE WHEN c.user_id = @userId THEN 1 ELSE 0 END as is_owner
        FROM Comments c
        JOIN Users u ON u.id = c.user_id
        WHERE c.post_id = @postId
        ORDER BY c.created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) as total
        FROM Comments
        WHERE post_id = @postId;
      `);

    const comments = commentsResult.recordsets[0];
    const total = commentsResult.recordsets[1][0].total;

    res.json({
      comments,
      total,
      hasMore: total > offset + comments.length
    });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ error: 'Erro ao listar comentários' });
  }
});

// Remover comentário
router.delete('/:postId/comments/:commentId', validateToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const pool = await sql.connect();

    // Verifica se o usuário é o autor do comentário ou o dono do post
    const commentResult = await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .input('postId', sql.UniqueIdentifier, postId)
      .query(`
        SELECT c.*, p.user_id as post_owner_id
        FROM Comments c
        JOIN Posts p ON p.id = c.post_id
        WHERE c.id = @commentId AND c.post_id = @postId
      `);

    if (!commentResult.recordset.length) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    // Permite deletar se for o autor do comentário ou dono do post
    if (commentResult.recordset[0].user_id !== userId && 
        commentResult.recordset[0].post_owner_id !== userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await pool.request()
      .input('commentId', sql.UniqueIdentifier, commentId)
      .query('DELETE FROM Comments WHERE id = @commentId');

    res.json({ message: 'Comentário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover comentário:', error);
    res.status(500).json({ error: 'Erro ao remover comentário' });
  }
});

// Atualizar contagem de comentários no post
router.get('/:postId/comments/count', validateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const pool = await sql.connect();
    const result = await pool.request()
      .input('postId', sql.UniqueIdentifier, postId)
      .query('SELECT COUNT(*) as count FROM Comments WHERE post_id = @postId');

    res.json({ count: result.recordset[0].count });
  } catch (error) {
    console.error('Erro ao contar comentários:', error);
    res.status(500).json({ error: 'Erro ao contar comentários' });
  }
});

// Listar posts
router.get('/', validateToken, async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT 
          p.*,
          u.username,
          u.avatar,
          CASE WHEN p.user_id = @userId THEN 1 ELSE 0 END as is_owner,
          (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) as comments_count,
          (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = @userId) as is_liked
        FROM Posts p
        JOIN Users u ON u.id = p.user_id
        ORDER BY p.created_at DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao listar posts:', error);
    res.status(500).json({ error: 'Erro ao listar posts' });
  }
});

// Deletar post
router.delete('/:postId', validateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const pool = await sql.connect();

    // Verifica se o usuário é o dono do post
    const postResult = await pool.request()
      .input('postId', sql.UniqueIdentifier, postId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT id, user_id
        FROM Posts
        WHERE id = @postId AND user_id = @userId
      `);

    if (!postResult.recordset.length) {
      return res.status(403).json({ error: 'Você não tem permissão para deletar este post' });
    }

    // Deleta o post (as foreign keys com CASCADE vão deletar comentários e outras relações)
    await pool.request()
      .input('postId', sql.UniqueIdentifier, postId)
      .query('DELETE FROM Posts WHERE id = @postId');

    res.json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro ao deletar post' });
  }
});

// Toggle like em um post
router.post('/:postId/like', validateToken, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    try {
        const pool = await sql.connect();

        // Verifica se o post existe
        const postCheck = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query('SELECT id FROM Posts WHERE id = @postId AND deleted_at IS NULL');

        if (postCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado'
            });
        }

        // Verifica se já existe um like
        const likeCheck = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, userId)
            .query('SELECT id FROM Likes WHERE post_id = @postId AND user_id = @userId');

        let action;
        if (likeCheck.recordset.length > 0) {
            // Remove o like
            await pool.request()
                .input('postId', sql.UniqueIdentifier, postId)
                .input('userId', sql.UniqueIdentifier, userId)
                .query('DELETE FROM Likes WHERE post_id = @postId AND user_id = @userId');
            action = 'removed';
        } else {
            // Adiciona o like
            await pool.request()
                .input('postId', sql.UniqueIdentifier, postId)
                .input('userId', sql.UniqueIdentifier, userId)
                .query('INSERT INTO Likes (post_id, user_id, created_at) VALUES (@postId, @userId, GETDATE())');
            action = 'added';
        }

        // Obtém a contagem atualizada de likes
        const likesCount = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query('SELECT COUNT(*) as count FROM Likes WHERE post_id = @postId');

        res.json({
            success: true,
            message: action === 'added' ? 'Like adicionado com sucesso' : 'Like removido com sucesso',
            action: action,
            likesCount: likesCount.recordset[0].count
        });
    } catch (error) {
        console.error('Erro ao processar like:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar like',
            error: error.message
        });
    }
});

// Toggle save/unsave post
router.post('/:postId/save', validateToken, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    try {
        const pool = await sql.connect();

        // Verifica se o post existe
        const postCheck = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query('SELECT id FROM Posts WHERE id = @postId AND deleted_at IS NULL');

        if (postCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado'
            });
        }

        // Verifica se já está salvo
        const saveCheck = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, userId)
            .query('SELECT id FROM SavedPosts WHERE post_id = @postId AND user_id = @userId');

        let action;
        if (saveCheck.recordset.length > 0) {
            // Remove dos salvos
            await pool.request()
                .input('postId', sql.UniqueIdentifier, postId)
                .input('userId', sql.UniqueIdentifier, userId)
                .query('DELETE FROM SavedPosts WHERE post_id = @postId AND user_id = @userId');
            action = 'removed';
        } else {
            // Adiciona aos salvos
            await pool.request()
                .input('postId', sql.UniqueIdentifier, postId)
                .input('userId', sql.UniqueIdentifier, userId)
                .query('INSERT INTO SavedPosts (post_id, user_id) VALUES (@postId, @userId)');
            action = 'saved';
        }

        res.json({
            success: true,
            message: action === 'saved' ? 'Post salvo com sucesso' : 'Post removido dos salvos',
            action: action
        });
    } catch (error) {
        console.error('Erro ao processar save:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar save',
            error: error.message
        });
    }
});

module.exports = router; 