import axios from "axios";
import Environment from "./Environment";

const API_BASE = Environment.API_BASE;

// Função auxiliar para converter Data URL para File
const dataURLtoFile = async (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
};

const Api = {
    // Função para gerar URL completa da imagem
    getImageUrl: (filename) => {
        if (!filename) return null;
        // Se já for uma URL completa, retorna ela mesma
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return filename;
        }
        // Se for base64, retorna o próprio base64
        if (filename.startsWith('data:')) {
            return filename;
        }
        // Caso contrário, constrói a URL para a API
        return `${API_BASE}/users/image/${filename}`;
    },
    getImageUrlProfile: (filename, type) => {
        if (!filename) return null;
        // Se já for uma URL completa, retorna ela mesma
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return filename;
        }
        // Se for base64, retorna o próprio base64
        if (filename.startsWith('data:')) {
            return filename;
        }
        return `${API_BASE}/users/image/${type}/${filename}`;
    },
    auth: async () => {
        try {
            const response = await axios.get(`${API_BASE}/users/auth`, Environment.HEADERS);
            return response;
        } catch (err) {
            return err;
        }
    },
    get: async () => {
        try {
            const response = await axios.get(`${API_BASE}/users/get`, Environment.HEADERS);
            if (response.data.success) {
                // Processa os dados do usuário para garantir que as URLs das imagens estejam corretas
                const userData = response.data.data;
                if (userData.avatar) {
                    userData.avatar = Api.getImageUrl(userData.avatar);
                }
                if (userData.coverImage) {
                    userData.coverImage = Api.getImageUrl(userData.coverImage);
                }
                return { ...response, data: { ...response.data, data: userData } };
            }
            return response;
        } catch (err) {
            return err;
        }
    },
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE}/users/login`, { email, password });
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro de conexão com o servidor.' };
        }
    },
    register: async (data) => {
        try {
            const response = await axios.post(`${API_BASE}/users/register`, data);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro de conexão com o servidor.' };
        }
    },
    googleLogin: async (data) => {
        try {
            const response = await axios.post(`${API_BASE}/users/google`, data);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro de conexão com o servidor.' };
        }
    },
    updateProfile: async (data) => {
        try {
            let profileData = { ...data };
            
            // Se tem arquivo de avatar em base64, faz upload primeiro
            if (data.avatar && data.avatar.startsWith('data:')) {
                const avatarFile = await dataURLtoFile(data.avatar, 'avatar.jpg');
                const avatarResponse = await Api.uploadMedia(avatarFile, 'avatar');
                if (avatarResponse.success) {
                    profileData.avatar = "avatar/"+avatarResponse.filename; // Salva apenas o nome do arquivo
                }
            }

            // Se tem arquivo de capa em base64, faz upload primeiro
            if (data.coverImage && data.coverImage.startsWith('data:')) {
                const coverFile = await dataURLtoFile(data.coverImage, 'cover.jpg');
                const coverResponse = await Api.uploadMedia(coverFile, 'cover');
                if (coverResponse.success) {
                    profileData.coverImage = "cover/"+coverResponse.filename; // Salva apenas o nome do arquivo
                }
            }

            // Remove os dados base64 antes de enviar para o servidor
            if (profileData.avatar && profileData.avatar.startsWith('data:')) {
                delete profileData.avatar;
            }
            if (profileData.coverImage && profileData.coverImage.startsWith('data:')) {
                delete profileData.coverImage;
            }

            const response = await axios.put(`${API_BASE}/users/update`, profileData, Environment.HEADERS);
            
            if (response.data.success) {
                // Processa os dados do usuário retornado para garantir que as URLs das imagens estejam corretas
                const userData = response.data.data;
                if (userData.avatar) {
                    userData.avatar = Api.getImageUrl(userData.avatar);
                }
                if (userData.coverImage) {
                    userData.coverImage = Api.getImageUrl(userData.coverImage);
                }
                return { ...response.data, data: userData };
            }
            
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro ao atualizar perfil.' };
        }
    },
    uploadMedia: async (file, type) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            
            // Remove o Content-Type do cabeçalho para permitir que o navegador defina o boundary correto
            const headers = { ...Environment.HEADERS.headers };
            delete headers['Content-Type'];
            
            const response = await axios.post(`${API_BASE}/users/upload`, formData, {
                ...Environment.HEADERS,
                headers: headers
            });
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            return { success: false, message: 'Erro ao fazer upload da mídia.' };
        }
    },
    // Função para gerar URL completa da mídia (imagem, vídeo ou áudio)
    getMediaUrl: (filename, type = 'image') => {
        if (!filename) return null;
        // Se já for uma URL completa, retorna ela mesma
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return filename;
        }
        // Se for base64, retorna o próprio base64
        if (filename.startsWith('data:')) {
            return filename;
        }
        // Caso contrário, constrói a URL para a API
        return `${API_BASE}/posts/media/${type}/${filename}`;
    },
    createPost: async (postData) => {
        try {
            // Prepara os dados do post
            const postPayload = {
                content: postData.content,
                mediaType: postData.mediaType,
                mediaUrl: postData.mediaUrl,
                isTemporary: postData.isTemporary,
                expirationDate: postData.isTemporary ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null, // 24 horas se for temporário
                scheduledDate: postData.scheduledDate,
                allowComments: postData.allowComments,
                isPaid: postData.isPaid,
                price: postData.isPaid ? postData.price : null,
                postType: postData.postType
            };

            // Adiciona dados específicos baseado no tipo do post
            if (postData.postType === 'poll') {
                postPayload.pollOptions = postData.pollOptions.filter(opt => opt.trim());
                postPayload.pollEndDate = postData.pollEndDate;
            } else if (postData.postType === 'quiz') {
                postPayload.quizQuestions = postData.quizQuestions;
                postPayload.quizEndDate = postData.quizEndDate;
            } else if (postData.postType === 'challenge') {
                postPayload.challengeDescription = postData.challengeDescription;
                postPayload.challengeEndDate = postData.challengeEndDate;
                postPayload.challengeReward = postData.challengeReward;
            }

            const response = await axios.post(`${API_BASE}/posts`, postPayload, Environment.HEADERS);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar post:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Erro ao criar post'
            };
        }
    },
    uploadMediaPost: async (formData) => {
        try {
            // Remove o Content-Type do cabeçalho para permitir que o navegador defina o boundary correto
            const headers = { ...Environment.HEADERS.headers };
            delete headers['Content-Type'];

            const response = await axios.post(`${API_BASE}/posts/upload`, formData, {
                ...Environment.HEADERS,
                headers: headers
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao fazer upload de mídia:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Erro ao fazer upload de mídia'
            };
        }
    },
    getFeed: async (page = 1, limit = 10) => {
        try {
            const response = await axios.get(`${API_BASE}/posts/feed/${page}/${limit}`, {
                headers: Environment.HEADERS
            });

            // Garante que todos os campos necessários estejam presentes
            const posts = response.data?.posts?.map(post => ({
                ...post,
                comments_count: post.comments_count || 0,
                likes_count: post.likes_count || 0,
                is_liked: post.is_liked || 0,
                is_owner: post.is_owner || 0
            }));

            return {
                success: true,
                posts
            };
        } catch (error) {
            console.error('Erro ao carregar feed:', error);
            return {
                success: false,
                posts: []
            };
        }
    },
    
    voteInPoll: async (postId, optionIndex) => {
        try {
            const response = await axios.post(`/posts/${postId}/vote`, { optionIndex });
            return response.data;
        } catch (error) {
            console.error('Erro ao votar na enquete:', error);
            throw error;
        }
    },
    
    submitQuizResponses: async (postId, responses) => {
        try {
            const response = await axios.post(`/posts/${postId}/quiz`, { responses });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar respostas do questionário:', error);
            throw error;
        }
    },
    
    articipateInChallenge: async (postId, formData) => {
        try {
            const response = await axios.post(`/posts/${postId}/challenge`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao participar do desafio:', error);
            throw error;
        }
    },

    // Adicionar comentário a um post
    addComment: async (postId, content) => {
        try {
            const response = await axios.post(`${API_BASE}/posts/${postId}/comments`, { content }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Deletar um comentário
    deleteComment: async (postId, commentId) => {
        try {
            const response = await axios.delete(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Listar comentários de um post
    getComments: async (postId, page = 1, limit = 10) => {
        try {
            const response = await axios.get(`${API_BASE}/posts/${postId}/comments`, {
                params: { page, limit },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Obter contagem de comentários de um post
    getCommentsCount: async (postId) => {
        try {
            const response = await axios.get(`${API_BASE}/posts/${postId}/comments/count`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Deletar um post
    deletePost: async (postId) => {
        try {
            const response = await axios.delete(`${API_BASE}/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Toggle like em um post
    toggleLike: async (postId) => {
        try {
            const response = await axios.post(`${API_BASE}/posts/${postId}/like`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Toggle save em um post
    toggleSave: async (postId) => {
        try {
            const response = await axios.post(`${API_BASE}/posts/${postId}/save`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default Api;
