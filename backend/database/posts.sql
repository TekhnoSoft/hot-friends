-- Tabela de Posts
CREATE TABLE Posts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    content TEXT,
    media_type VARCHAR(20), -- 'image', 'audio', null
    media_url VARCHAR(500),
    is_temporary BIT DEFAULT 0,
    expiration_date DATETIME,
    scheduled_date DATETIME,
    allow_comments BIT DEFAULT 1,
    is_paid BIT DEFAULT 0,
    price DECIMAL(10,2),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    deleted_at DATETIME,
    post_type VARCHAR(20) DEFAULT 'regular', -- 'regular', 'poll', 'quiz', 'challenge'
    
    -- Campos específicos para enquetes
    poll_options NVARCHAR(MAX), -- JSON com as opções da enquete
    poll_end_date DATETIME,
    
    -- Campos específicos para questionários
    quiz_questions NVARCHAR(MAX), -- JSON com as perguntas e respostas
    quiz_end_date DATETIME,
    
    -- Campos específicos para desafios
    challenge_description TEXT,
    challenge_end_date DATETIME,
    challenge_reward TEXT,
    
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Tabela de Votos em Enquetes
CREATE TABLE PollVotes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    post_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    option_index INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (post_id) REFERENCES Posts(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Tabela de Respostas de Questionários
CREATE TABLE QuizResponses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    post_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    responses NVARCHAR(MAX), -- JSON com as respostas
    score INT,
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (post_id) REFERENCES Posts(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Tabela de Participações em Desafios
CREATE TABLE ChallengeParticipations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    post_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    submission_text TEXT,
    submission_media_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (post_id) REFERENCES Posts(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Índices para melhor performance
CREATE INDEX idx_posts_user_id ON Posts(user_id);
CREATE INDEX idx_posts_created_at ON Posts(created_at);
CREATE INDEX idx_posts_post_type ON Posts(post_type);
CREATE INDEX idx_posts_scheduled_date ON Posts(scheduled_date);
CREATE INDEX idx_poll_votes_post_id ON PollVotes(post_id);
CREATE INDEX idx_quiz_responses_post_id ON QuizResponses(post_id);
CREATE INDEX idx_challenge_participations_post_id ON ChallengeParticipations(post_id);

CREATE TABLE Comments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    post_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alterar a coluna content para NVARCHAR(MAX)
ALTER TABLE Comments
ALTER COLUMN content NVARCHAR(MAX) NOT NULL;

-- Criar tabela de Likes
CREATE TABLE Likes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    post_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Criar índice composto para evitar likes duplicados e melhorar performance de consultas
CREATE UNIQUE INDEX idx_likes_post_user ON Likes(post_id, user_id);

-- Criar índice para melhorar performance das contagens
CREATE INDEX idx_likes_post_id ON Likes(post_id);

-- Tabela para armazenar os posts salvos
CREATE TABLE SavedPosts (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    post_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    -- Garante que um usuário não pode salvar o mesmo post mais de uma vez
    CONSTRAINT UC_UserPost UNIQUE (user_id, post_id)
); 