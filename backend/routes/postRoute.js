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
    
    // Detecta se é Windows ou Linux
    const isWindows = os.platform() === 'win32';
    console.log('Platform:', isWindows ? 'Windows' : 'Linux');
    
    // Possíveis caminhos para o volume no container (pasta 'upload')
    const possiblePaths = [
        '/app/upload',            // Caminho padrão comum
        '/upload',                // Caminho na raiz
        './upload',               // Caminho relativo
        '/app/volumes/upload',    // Possível caminho do volume
        '/data/upload',           // Outro caminho comum
        path.join(__dirname, '..', 'upload'), // Relativo ao projeto
        path.join(process.cwd(), 'upload'),   // Relativo ao diretório de trabalho
        path.join(__dirname, 'upload'),       // Relativo ao arquivo atual
    ];
    
    // No Windows, usa o caminho original
    if (isWindows) {
        possiblePaths.unshift('C:\\upload');
    }
    
    console.log('Procurando arquivo:', filename);
    console.log('Diretório de trabalho atual:', process.cwd());
    console.log('__dirname:', __dirname);
    
    // Função para tentar encontrar o arquivo em diferentes locais
    const findFile = (paths, index = 0) => {
        if (index >= paths.length) {
            console.error('Arquivo não encontrado em nenhum dos caminhos possíveis');
            return res.status(404).json({ 
                error: 'Arquivo não encontrado',
                filename: filename,
                searchedPaths: paths
            });
        }
        
        const currentPath = paths[index];
        const filePath = path.resolve(currentPath, filename);
        
        console.log(`Tentativa ${index + 1}: ${filePath}`);
        
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // Tenta o próximo caminho
                findFile(paths, index + 1);
            } else {
                console.log('Arquivo encontrado em:', filePath);
                // Arquivo encontrado, serve ele
                serveFile(filePath);
            }
        });
    };
    
    const serveFile = (filePath) => {
    
        // Verifica se é um arquivo (não diretório)
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error('Erro ao verificar estatísticas do arquivo:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!stats.isFile()) {
                console.error('O caminho não é um arquivo:', filePath);
                return res.status(404).json({ error: 'Arquivo não encontrado' });
            }
            
            // Serve o arquivo
            res.sendFile(filePath, (err) => {
                if (err) {
                    console.error('Erro ao servir arquivo:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Erro ao servir arquivo' });
                    }
                }
            });
        });
    };
    
    // Inicia a busca pelos caminhos possíveis
    findFile(possiblePaths);
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
                WITH PollOptions AS (
                    SELECT 
                        p.id as post_id,
                        options.option_index,
                        COUNT(DISTINCT v.id) as vote_count,
                        (SELECT COUNT(*) FROM PollVotes WHERE post_id = p.id) as total_votes
                    FROM Posts p
                    CROSS APPLY (
                        SELECT 
                            ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1 as option_index
                        FROM OPENJSON(p.poll_options)
                    ) options
                    LEFT JOIN PollVotes v ON v.post_id = p.id AND v.option_index = options.option_index
                    WHERE p.post_type = 'poll'
                    GROUP BY p.id, options.option_index
                ),
                PollResults AS (
                    SELECT 
                        post_id,
                        '[' + STRING_AGG(
                            CAST(
                                CAST(
                                    ROUND(
                                        CASE 
                                            WHEN total_votes > 0 THEN CAST(vote_count AS FLOAT) * 100.0 / total_votes
                                            ELSE 0
                                        END,
                                        1
                                    ) AS DECIMAL(5,1)
                                ) AS VARCHAR(10)
                            ),
                            ','
                        ) WITHIN GROUP (ORDER BY option_index) + ']' as poll_results,
                        SUM(vote_count) as total_votes
                    FROM PollOptions
                    GROUP BY post_id
                ),
                PollData AS (
                    SELECT 
                        p.id as post_id,
                        pv.option_index as user_vote_index,
                        CASE WHEN pv2.id IS NOT NULL THEN 1 ELSE 0 END as has_voted,
                        pr.total_votes,
                        pr.poll_results
                    FROM Posts p
                    LEFT JOIN PollVotes pv ON p.id = pv.post_id AND pv.user_id = @userId
                    LEFT JOIN PollVotes pv2 ON p.id = pv2.post_id AND pv2.user_id = @userId
                    LEFT JOIN PollResults pr ON p.id = pr.post_id
                    WHERE p.post_type = 'poll'
                    GROUP BY p.id, pv.id, pv.option_index, pv2.id, pr.total_votes, pr.poll_results
                )
                SELECT 
                    p.*,
                    u.username,
                    u.avatar,
                    CASE WHEN p.user_id = @userId THEN 1 ELSE 0 END as is_owner,
                    (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) as comments_count,
                    (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as likes_count,
                    (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = @userId) as is_liked,
                    (SELECT COUNT(*) FROM SavedPosts WHERE post_id = p.id AND user_id = @userId) as is_saved,
                    pd.user_vote_index as user_vote_index,
                    pd.has_voted as user_voted,
                    pd.total_votes as total_votes,
                    pd.poll_results as poll_results
                FROM Posts p
                INNER JOIN Users u ON p.user_id = u.id
                LEFT JOIN PollData pd ON p.id = pd.post_id
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

        const posts = result.recordsets[0].map(post => {
            if (post.post_type === 'poll' && post.poll_results) {
                try {
                    // Garantir que poll_results seja um array
                    const pollResults = JSON.parse(post.poll_results || '[]');
                    // Preencher com zeros se necessário
                    const pollOptions = JSON.parse(post.poll_options || '[]');
                    post.pollResults = Array(pollOptions.length).fill(0).map((_, i) => 
                        pollResults[i] || 0
                    );
                } catch (e) {
                    console.error('Erro ao processar resultados da enquete:', e);
                    post.pollResults = [];
                }
            }
            return post;
        });

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

        // Calcular os resultados atualizados da enquete
        const results = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query(`
                WITH VoteCount AS (
                    SELECT 
                        option_index,
                        COUNT(*) as votes,
                        (SELECT COUNT(*) FROM PollVotes WHERE post_id = @postId) as total_votes
                    FROM PollVotes
                    WHERE post_id = @postId
                    GROUP BY option_index
                )
                SELECT 
                    option_index,
                    votes,
                    CAST(ROUND(CAST(votes AS FLOAT) * 100 / total_votes, 1) AS DECIMAL(5,1)) as percentage
                FROM VoteCount
                ORDER BY option_index
            `);

        // Formatar os resultados em um array
        const pollResults = Array(4).fill(0); // Assumindo máximo de 4 opções
        results.recordset.forEach(result => {
            pollResults[result.option_index] = result.percentage;
        });

        res.json({
            success: true,
            message: 'Voto registrado com sucesso!',
            pollResults,
            totalVotes: results.recordset.reduce((acc, curr) => acc + curr.votes, 0)
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

// Obter resultados do quiz
router.get('/:postId/quiz-results', validateToken, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const pool = await sql.connect();

        // Buscar informações do quiz e resposta do usuário
        const result = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, userId)
            .query(`
                SELECT 
                    p.quiz_questions,
                    p.quiz_end_date,
                    qr.responses as user_responses,
                    qr.score as user_score,
                    (SELECT COUNT(*) FROM QuizResponses WHERE post_id = @postId) as total_responses,
                    (
                        SELECT AVG(CAST(score AS FLOAT))
                        FROM QuizResponses
                        WHERE post_id = @postId
                    ) as average_score
                FROM Posts p
                LEFT JOIN QuizResponses qr ON p.id = qr.post_id AND qr.user_id = @userId
                WHERE p.id = @postId AND p.post_type = 'quiz'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Quiz não encontrado'
            });
        }

        const record = result.recordset[0];
        const quizQuestions = JSON.parse(record.quiz_questions || '[]');
        const userResponses = record.user_responses ? JSON.parse(record.user_responses) : null;
        
        // Se o quiz ainda não terminou e o usuário não respondeu, não mostrar as respostas corretas
        const quizEnded = record.quiz_end_date && new Date(record.quiz_end_date) < new Date();
        const hasUserResponded = userResponses !== null;

        // Calcular estatísticas por questão
        const questionStats = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query(`
                WITH ResponseData AS (
                    SELECT 
                        responses,
                        CAST(JSON_VALUE(value, '$.index') AS INT) as question_index,
                        JSON_VALUE(value, '$.response') as selected_option
                    FROM QuizResponses
                    CROSS APPLY OPENJSON(responses)
                    WHERE post_id = @postId
                )
                SELECT 
                    question_index,
                    selected_option,
                    COUNT(*) as option_count,
                    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM QuizResponses WHERE post_id = @postId) AS DECIMAL(5,2)) as percentage
                FROM ResponseData
                GROUP BY question_index, selected_option
                ORDER BY question_index, selected_option
            `);

        // Processar estatísticas por questão
        const statistics = {};
        questionStats.recordset.forEach(stat => {
            if (!statistics[stat.question_index]) {
                statistics[stat.question_index] = {};
            }
            statistics[stat.question_index][stat.selected_option] = {
                count: stat.option_count,
                percentage: stat.percentage
            };
        });

        // Preparar resposta
        const response = {
            success: true,
            quiz_ended: quizEnded,
            total_responses: record.total_responses,
            average_score: parseFloat(record.average_score || 0).toFixed(1),
            questions: quizQuestions.map((q, index) => ({
                question: q.question,
                options: q.options,
                statistics: statistics[index] || {},
                ...(quizEnded || hasUserResponded ? { correctOption: q.correctOption } : {}),
                ...(hasUserResponded ? { userResponse: userResponses[index] } : {})
            })),
            ...(hasUserResponded ? {
                user_score: record.user_score,
                total_questions: quizQuestions.length
            } : {})
        };

        res.json(response);
    } catch (error) {
        console.error('Erro ao buscar resultados do quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar resultados do quiz',
            error: error.message
        });
    }
});

// Responder quiz
router.post('/:postId/quiz', validateToken, async (req, res) => {
    const { postId } = req.params;
    const { responses } = req.body;

    try {
        const pool = await sql.connect();
        
        // Verificar se o quiz existe e ainda não terminou
        const quizCheck = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('currentDate', sql.DateTime, new Date())
            .query(`
                SELECT quiz_questions, quiz_end_date 
                FROM Posts 
                WHERE id = @postId 
                AND post_type = 'quiz'
                AND (quiz_end_date IS NULL OR quiz_end_date > @currentDate)
            `);

        if (quizCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Quiz não encontrado ou já encerrado'
            });
        }

        // Verificar se o usuário já respondeu
        const checkResponse = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, req.user.id)
            .query('SELECT id FROM QuizResponses WHERE post_id = @postId AND user_id = @userId');

        if (checkResponse.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Você já respondeu este quiz'
            });
        }

        const quizQuestions = JSON.parse(quizCheck.recordset[0].quiz_questions);
        
        // Validar respostas
        if (!Array.isArray(responses) || responses.length !== quizQuestions.length) {
            return res.status(400).json({
                success: false,
                message: 'Formato de respostas inválido'
            });
        }

        // Calcular pontuação
        let score = 0;
        const formattedResponses = responses.map((response, index) => ({
            index,
            response,
            correct: response === quizQuestions[index].correctOption
        }));

        score = formattedResponses.filter(r => r.correct).length;

        // Registrar resposta em uma transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Registrar resposta
            await transaction.request()
                .input('postId', sql.UniqueIdentifier, postId)
                .input('userId', sql.UniqueIdentifier, req.user.id)
                .input('responses', sql.NVarChar(sql.MAX), JSON.stringify(formattedResponses))
                .input('score', sql.Int, score)
                .query(`
                    INSERT INTO QuizResponses (post_id, user_id, responses, score)
                    VALUES (@postId, @userId, @responses, @score)
                `);

            await transaction.commit();

            // Buscar estatísticas atualizadas
            const stats = await pool.request()
                .input('postId', sql.UniqueIdentifier, postId)
                .query(`
                    SELECT 
                        COUNT(*) as total_responses,
                        AVG(CAST(score AS FLOAT)) as average_score
                    FROM QuizResponses
                    WHERE post_id = @postId
                `);

            res.json({
                success: true,
                message: 'Respostas registradas com sucesso!',
                score,
                total_questions: quizQuestions.length,
                correct_answers: formattedResponses.filter(r => r.correct).length,
                total_responses: stats.recordset[0].total_responses,
                average_score: parseFloat(stats.recordset[0].average_score || 0).toFixed(1)
            });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Erro ao responder quiz:', error);
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

    // Inicia uma transação para garantir que todas as deleções sejam feitas ou nenhuma
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Deleta os likes
      await transaction.request()
        .input('postId', sql.UniqueIdentifier, postId)
        .query('DELETE FROM Likes WHERE post_id = @postId');

      // Deleta os comentários
      await transaction.request()
        .input('postId', sql.UniqueIdentifier, postId)
        .query('DELETE FROM Comments WHERE post_id = @postId');

      // Deleta os votos da enquete
      await transaction.request()
        .input('postId', sql.UniqueIdentifier, postId)
        .query('DELETE FROM PollVotes WHERE post_id = @postId');

      // Deleta as participações em desafios
      await transaction.request()
        .input('postId', sql.UniqueIdentifier, postId)
        .query('DELETE FROM ChallengeParticipations WHERE post_id = @postId');

      // Deleta as respostas do quiz
      await transaction.request()
        .input('postId', sql.UniqueIdentifier, postId)
        .query('DELETE FROM QuizResponses WHERE post_id = @postId');

      // Deleta os posts salvos
      await transaction.request()
        .input('postId', sql.UniqueIdentifier, postId)
        .query('DELETE FROM SavedPosts WHERE post_id = @postId');

      // Por fim, deleta o post
      await transaction.request()
        .input('postId', sql.UniqueIdentifier, postId)
        .query('DELETE FROM Posts WHERE id = @postId');

      // Commit da transação
      await transaction.commit();

      res.json({ 
        success: true,
        message: 'Post e todos os dados relacionados foram deletados com sucesso' 
      });
    } catch (err) {
      // Se houver erro, faz rollback da transação
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao deletar post',
      error: error.message 
    });
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

// Buscar resultados da enquete
router.get('/:postId/poll-results', validateToken, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const pool = await sql.connect();
        
        // Verificar se o post existe e é uma enquete
        const postCheck = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query(`
                SELECT poll_options, poll_end_date 
                FROM Posts 
                WHERE id = @postId AND post_type = 'poll' AND deleted_at IS NULL
            `);

        if (postCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enquete não encontrada'
            });
        }

        // Verificar se o usuário já votou
        const userVoteCheck = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .input('userId', sql.UniqueIdentifier, userId)
            .query('SELECT id, option_index FROM PollVotes WHERE post_id = @postId AND user_id = @userId');

        // Calcular os resultados
        const results = await pool.request()
            .input('postId', sql.UniqueIdentifier, postId)
            .query(`
                WITH VoteCount AS (
                    SELECT 
                        option_index,
                        COUNT(*) as votes,
                        (SELECT COUNT(*) FROM PollVotes WHERE post_id = @postId) as total_votes
                    FROM PollVotes
                    WHERE post_id = @postId
                    GROUP BY option_index
                )
                SELECT 
                    option_index,
                    votes,
                    CAST(ROUND(CAST(votes AS FLOAT) * 100 / NULLIF(total_votes, 0), 1) AS DECIMAL(5,1)) as percentage
                FROM VoteCount
                ORDER BY option_index
            `);

        // Formatar os resultados em um array
        const pollResults = Array(JSON.parse(postCheck.recordset[0].poll_options).length).fill(0);
        results.recordset.forEach(result => {
            pollResults[result.option_index] = result.percentage || 0;
        });

        const totalVotes = results.recordset.reduce((acc, curr) => acc + curr.votes, 0);

        res.json({
            success: true,
            pollResults,
            totalVotes,
            userVoted: userVoteCheck.recordset.length > 0,
            userVoteIndex: userVoteCheck.recordset[0]?.option_index,
            pollEndDate: postCheck.recordset[0].poll_end_date
        });
    } catch (error) {
        console.error('Erro ao buscar resultados da enquete:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar resultados da enquete',
            error: error.message
        });
    }
});

module.exports = router; 