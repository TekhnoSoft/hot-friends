import React, { useState, useRef, useEffect } from 'react';
import { useMainContext } from '../../helpers/MainContext';
import Modal from '../Modal';
import Api from '../../Api';
import {
    Image,
    Mic,
    Clock,
    Calendar,
    PieChart,
    MessageSquare,
    DollarSign,
    Smile,
    HelpCircle,
    Award,
    X,
    Plus,
    Send,
    Square,
    StopCircle,
    Video
} from 'lucide-react';
import './style.css';

const CreatePostModal = ({ isOpen, onClose }) => {
    const { user, refreshFeed } = useMainContext();
    const fileInputRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const initialState = {
        content: '',
        mediaType: null,
        mediaFile: null,
        mediaPreview: null,
        isTemporary: false,
        expirationDate: null,
        scheduledDate: null,
        allowComments: true,
        isPaid: false,
        price: 0,
        postType: 'regular',
        pollOptions: ['', ''],
        pollEndDate: null,
        quizQuestions: [{ question: '', options: ['', ''], correctOption: 0 }],
        quizEndDate: null,
        challengeDescription: '',
        challengeEndDate: null,
        challengeReward: ''
    };

    const [postData, setPostData] = useState(initialState);

    // Função para resetar o estado quando o modal for fechado
    const handleClose = () => {
        setPostData(initialState);
        setIsRecording(false);
        setAudioURL(null);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    // Função para iniciar a gravação de áudio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);
                
                // Criar arquivo de áudio para upload
                const audioFile = new File([audioBlob], 'recorded_audio.mp3', { type: 'audio/mp3' });
                setPostData({
                    ...postData,
                    mediaType: 'audio',
                    mediaFile: audioFile,
                    mediaPreview: 'Áudio gravado'
                });
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
        }
    };

    // Função para parar a gravação
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleContentChange = (e) => {
        setPostData({ ...postData, content: e.target.value });
    };

    const handleMediaClick = (type) => {
        if (type === 'image' || type === 'video') {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            alert('Por favor, selecione uma imagem ou vídeo válido.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPostData({
                ...postData,
                mediaType: isVideo ? 'video' : 'image',
                mediaFile: file,
                mediaPreview: reader.result
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveMedia = () => {
        setPostData({
            ...postData,
            mediaType: null,
            mediaFile: null,
            mediaPreview: null
        });
        setAudioURL(null);
    };

    const handlePollOptionChange = (index, value) => {
        const newOptions = [...postData.pollOptions];
        newOptions[index] = value;
        setPostData({ ...postData, pollOptions: newOptions });
    };

    const addPollOption = () => {
        if (postData.pollOptions.length < 5) {
            setPostData({
                ...postData,
                pollOptions: [...postData.pollOptions, '']
            });
        }
    };

    const handleQuizQuestionChange = (index, field, value, optionIndex = null) => {
        const newQuestions = [...postData.quizQuestions];
        if (optionIndex !== null) {
            newQuestions[index].options[optionIndex] = value;
        } else if (field === 'correctOption') {
            newQuestions[index][field] = parseInt(value);
        } else {
            newQuestions[index][field] = value;
        }
        setPostData({ ...postData, quizQuestions: newQuestions });
    };

    const addQuizQuestion = () => {
        setPostData({
            ...postData,
            quizQuestions: [
                ...postData.quizQuestions,
                { question: '', options: ['', ''], correctOption: 0 }
            ]
        });
    };

    const handleSubmit = async () => {
        try {
            // Upload de mídia primeiro, se houver
            let mediaUrl = null;
            if (postData.mediaFile) {
                const formData = new FormData();
                formData.append('file', postData.mediaFile);
                formData.append('type', 'post');
                const mediaResponse = await Api.uploadMediaPost(formData);
                if (mediaResponse.success) {
                    mediaUrl = mediaResponse.filename;
                }
            }

            // Preparar dados do post
            const postPayload = {
                content: postData.content,
                mediaType: postData.mediaType,
                mediaUrl: mediaUrl,
                isTemporary: postData.isTemporary,
                expirationDate: postData.expirationDate,
                scheduledDate: postData.scheduledDate,
                allowComments: postData.allowComments,
                isPaid: postData.isPaid,
                price: postData.isPaid ? parseFloat(postData.price) : null,
                postType: postData.postType
            };

            // Adicionar dados específicos do tipo de post
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

            const response = await Api.createPost(postPayload);

            if (response.success) {
                refreshFeed();
                onClose();
                // Resetar o estado
                setPostData(initialState);
            }
        } catch (error) {
            console.error('Erro ao criar post:', error);
        }
    };

    const renderToolbar = () => (
        <div className="hf-post-toolbar">
            <button
                onClick={() => handleMediaClick('image')}
                className={postData.mediaType === 'image' ? 'active' : ''}
            >
                <Image size={20} />
                <span className="hf-button-text">Foto</span>
            </button>
            <button
                onClick={() => handleMediaClick('video')}
                className={postData.mediaType === 'video' ? 'active' : ''}
            >
                <Video size={20} />
                <span className="hf-button-text">Vídeo</span>
            </button>
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording || postData.mediaType === 'audio' ? 'active' : ''}
            >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                <span className="hf-button-text">{isRecording ? 'Parar' : 'Áudio'}</span>
            </button>
            <button
                onClick={() => setPostData({ ...postData, isTemporary: !postData.isTemporary })}
                className={postData.isTemporary ? 'active' : ''}
            >
                <Clock size={20} />
                <span className="hf-button-text">Temporário</span>
            </button>
            <button
                onClick={() => setPostData({ ...postData, scheduledDate: postData.scheduledDate ? null : new Date() })}
                className={postData.scheduledDate ? 'active' : ''}
            >
                <Calendar size={20} />
                <span className="hf-button-text">Agendar</span>
            </button>
            <button
                onClick={() => setPostData({ ...postData, postType: postData.postType === 'poll' ? 'regular' : 'poll' })}
                className={postData.postType === 'poll' ? 'active' : ''}
            >
                <PieChart size={20} />
                <span className="hf-button-text">Enquete</span>
            </button>
            <button
                onClick={() => setPostData({ ...postData, allowComments: !postData.allowComments })}
                className={postData.allowComments ? 'active' : ''}
            >
                <MessageSquare size={20} />
                <span className="hf-button-text">Comentários</span>
            </button>
            <button
                onClick={() => setPostData({ ...postData, isPaid: !postData.isPaid })}
                className={postData.isPaid ? 'active' : ''}
            >
                <DollarSign size={20} />
                <span className="hf-button-text">Pago</span>
            </button>
            <button
                onClick={() => setPostData({ ...postData, postType: postData.postType === 'quiz' ? 'regular' : 'quiz' })}
                className={postData.postType === 'quiz' ? 'active' : ''}
            >
                <HelpCircle size={20} />
                <span className="hf-button-text">Quiz</span>
            </button>
            <button
                onClick={() => setPostData({ ...postData, postType: postData.postType === 'challenge' ? 'regular' : 'challenge' })}
                className={postData.postType === 'challenge' ? 'active' : ''}
            >
                <Award size={20} />
                <span className="hf-button-text">Desafio</span>
            </button>
        </div>
    );

    const formatPrice = (value) => {
        // Remove tudo que não é número
        let numbers = value.replace(/\D/g, '');
        
        // Converte para centavos
        numbers = parseInt(numbers) || 0;
        
        // Formata para reais
        const reais = Math.floor(numbers / 100);
        const centavos = numbers % 100;
        
        // Adiciona pontos nos milhares
        const reaisFormatado = reais.toLocaleString('pt-BR');
        
        // Retorna no formato R$ X.XXX,XX
        return `R$ ${reaisFormatado},${centavos.toString().padStart(2, '0')}`;
    };

    const unformatPrice = (value) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');
        return parseInt(numbers) || 0;
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        const priceInCents = unformatPrice(value);
        const formattedPrice = formatPrice(priceInCents.toString());
        setPostData({ ...postData, price: priceInCents });
        e.target.value = formattedPrice;
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            className="hf-create-post-modal"
            title="Nova Postagem"
        >
            <div>
                <textarea
                    className="hf-post-content"
                    placeholder="O que você está pensando?"
                    value={postData.content}
                    onChange={handleContentChange}
                />

                {postData.mediaPreview && (
                    <div className="hf-media-preview">
                        {postData.mediaType === 'image' ? (
                            <img src={postData.mediaPreview} alt="Preview" />
                        ) : postData.mediaType === 'video' ? (
                            <video src={postData.mediaPreview} controls />
                        ) : (
                            <div className="hf-audio-preview">
                                <audio src={audioURL} controls />
                                <span>Áudio gravado</span>
                            </div>
                        )}
                        <button className="hf-remove-media" onClick={handleRemoveMedia}>
                            <X size={20} />
                        </button>
                    </div>
                )}

                {isRecording && (
                    <div className="hf-audio-recorder">
                        <div className="hf-audio-recorder-buttons">
                            <button className="stop-button" onClick={stopRecording}>
                                <StopCircle size={20} />
                                <span>Parar Gravação</span>
                            </button>
                        </div>
                    </div>
                )}

                {renderToolbar()}

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                />

                {postData.scheduledDate && (
                    <div className="hf-post-settings">
                        <h4>Agendar Publicação</h4>
                        <input
                            type="datetime-local"
                            value={postData.scheduledDate ? new Date(postData.scheduledDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setPostData({ ...postData, scheduledDate: new Date(e.target.value) })}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                )}

                {!postData.allowComments && (
                    <div className="hf-comments-disabled-notice">
                        <MessageSquare size={16} />
                        Comentários desativados para esta publicação
                    </div>
                )}

                {postData.isTemporary && (
                    <div className="hf-temporary-post-notice">
                        <Clock size={16} />
                        Esta publicação será temporária
                    </div>
                )}

                {postData.isPaid && (
                    <div className="hf-post-settings">
                        <h4>Preço da Publicação</h4>
                        <input
                            type="text"
                            placeholder="R$ 0,00"
                            defaultValue="R$ 0,00"
                            onChange={handlePriceChange}
                            className="hf-price-input"
                        />
                    </div>
                )}

                {postData.postType === 'poll' && (
                    <div className="hf-post-settings">
                        <h4>Configurações da Enquete</h4>
                        {postData.pollOptions.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                placeholder={`Opção ${index + 1}`}
                            />
                        ))}
                        {postData.pollOptions.length < 5 && (
                            <button className="hf-add-option" onClick={addPollOption}>
                                <Plus size={20} /> Adicionar opção
                            </button>
                        )}
                        <input
                            type="datetime-local"
                            value={postData.pollEndDate || ''}
                            onChange={(e) => setPostData({ ...postData, pollEndDate: e.target.value })}
                            placeholder="Data de término"
                        />
                    </div>
                )}

                {postData.postType === 'quiz' && (
                    <div className="hf-post-settings">
                        <h4>Configurações do Questionário</h4>
                        {postData.quizQuestions.map((question, qIndex) => (
                            <div key={qIndex} className="hf-quiz-question">
                                <input
                                    type="text"
                                    value={question.question}
                                    onChange={(e) => handleQuizQuestionChange(qIndex, 'question', e.target.value)}
                                    placeholder="Pergunta"
                                />
                                {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="hf-quiz-option">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleQuizQuestionChange(qIndex, 'options', e.target.value, oIndex)}
                                            placeholder={`Opção ${oIndex + 1}`}
                                        />
                                        <input
                                            type="radio"
                                            checked={question.correctOption === oIndex}
                                            onChange={() => handleQuizQuestionChange(qIndex, 'correctOption', oIndex)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button className="hf-add-question" onClick={addQuizQuestion}>
                            <Plus size={20} /> Adicionar pergunta
                        </button>
                        <input
                            type="datetime-local"
                            value={postData.quizEndDate || ''}
                            onChange={(e) => setPostData({ ...postData, quizEndDate: e.target.value })}
                            placeholder="Data de término"
                        />
                    </div>
                )}

                {postData.postType === 'challenge' && (
                    <div className="hf-post-settings">
                        <h4>Configurações do Desafio</h4>
                        <textarea
                            value={postData.challengeDescription}
                            onChange={(e) => setPostData({ ...postData, challengeDescription: e.target.value })}
                            placeholder="Descrição do desafio"
                        />
                        <input
                            type="text"
                            value={postData.challengeReward}
                            onChange={(e) => setPostData({ ...postData, challengeReward: e.target.value })}
                            placeholder="Recompensa"
                        />
                        <input
                            type="datetime-local"
                            value={postData.challengeEndDate || ''}
                            onChange={(e) => setPostData({ ...postData, challengeEndDate: e.target.value })}
                            placeholder="Data de término"
                        />
                    </div>
                )}

                <button className="hf-submit-post" onClick={handleSubmit}>
                    <Send size={20} />
                    Publicar
                </button>
            </div>
        </Modal>
    );
};

export default CreatePostModal; 