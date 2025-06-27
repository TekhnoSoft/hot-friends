import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Heart,
  MessageCircle,
  Gift,
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  FolderPlus,
  EyeOff,
  Flag,
  Lock,
  PieChart,
  HelpCircle,
  Award,
  Mic,
  DollarSign,
  UnlockKeyhole,
  Image,
  Trash2,
  Send,
  Trash
} from 'lucide-react';
import GiftModal from '../GiftModal';
import PaymentModal from '../PaymentModal';
import Api from '../../Api';
import { MainContext } from '../../helpers/MainContext';
import './style.css';
import Environment from '../../Environment';
import { toast } from 'react-hot-toast';

const Post = ({ post, onDelete, showActions = true }) => {
  const { user } = useContext(MainContext);
  const [isLiked, setIsLiked] = useState(post.is_liked === 1);
  const [isSaved, setIsSaved] = useState(post.is_saved === 1);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [selectedPollOption, setSelectedPollOption] = useState(post.user_vote_index ?? null);
  const [quizResponses, setQuizResponses] = useState({});
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVoted, setUserVoted] = useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState(false);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const handleLike = async (event) => {
    event.stopPropagation();
    
    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await Api.toggleLike(post.id);
      if (!response.success) {
        // Reverte as mudanças se a requisição falhar
        setIsLiked(wasLiked);
        setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Erro ao processar like:', error);
      // Reverte as mudanças em caso de erro
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async (event) => {
    event.stopPropagation();
    try {
      setIsSaved(!isSaved);
      const response = await Api.toggleSave(post.id);
      if (response.success) {
        setIsSaved(response.action === 'saved');
      }
    } catch (error) {
      setIsSaved(!isSaved);
      console.error('Erro ao salvar post:', error);
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        videoRef.current.muted = false;
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGiftClick = () => {
    setShowGiftModal(true);
  };

  const handleMenuToggle = (event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId ? null : post.id);
  };

  const handleMenuAction = async (action, event) => {
    event.stopPropagation();
    setOpenMenuId(null);

    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        break;
      case 'delete':
        if (window.confirm('Tem certeza que deseja deletar este post?')) {
          try {
            await Api.deletePost(post.id);
            setIsVisible(false);
            if (onDelete) {
              onDelete(post.id);
            }
          } catch (error) {
            console.error('Erro ao deletar post:', error);
            alert('Erro ao deletar post. Tente novamente.');
          }
        }
        break;
      case 'collection':
        handleSave(event);
        break;
      case 'report':
        console.log('Denunciar post');
        break;
      default:
        break;
    }
  };

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const response = await Api.getComments(post.id);
      setComments(response.comments || []);
      setCommentsCount(response.total || 0);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await Api.addComment(post.id, newComment);
      setComments(prev => Array.isArray(prev) ? [comment, ...prev] : [comment]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleRemoveComment = async (commentId) => {
    if (!window.confirm('Tem certeza que deseja remover este comentário?')) return;

    try {
      await Api.deleteComment(post.id, commentId);
      setComments(prev => Array.isArray(prev) ? prev.filter(comment => comment.id !== commentId) : []);
      setCommentsCount(prev => prev - 1);
    } catch (error) {
      console.error('Erro ao remover comentário:', error);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInHours < 24) return `${diffInHours} h`;
    if (diffInDays < 365) return `${diffInDays} d`;
    return `${diffInYears} a`;
  };

  useEffect(() => {
    const loadPollResults = async () => {
      if (post.post_type === 'poll') {
        try {
          // Se já temos os dados no post, use-os
          if (post.poll_results) {
            let results;
            try {
              // Tentar usar pollResults primeiro (array já processado)
              if (Array.isArray(post.pollResults)) {
                results = post.pollResults;
              } else {
                // Se não tiver pollResults, processar poll_results
                results = typeof post.poll_results === 'string' 
                  ? JSON.parse(post.poll_results) 
                  : post.poll_results;
              }
            } catch (e) {
              console.error('Erro ao processar poll_results:', e);
              results = [];
            }
            
            // Garantir que os resultados sejam um array válido
            const pollOptions = parseSafeJson(post.poll_options);
            const validResults = Array.isArray(results) 
              ? results.map(r => parseFloat(r) || 0)
              : Array(pollOptions.length).fill(0);

            setPollResults(validResults);
            setTotalVotes(post.total_votes || 0);
            setUserVoted(post.user_voted === 1);
            if (post.user_vote_index !== undefined && post.user_vote_index !== null) {
              setSelectedPollOption(post.user_vote_index);
            }
          } else {
            // Se não temos os dados, busque do backend
            const response = await Api.getPollResults(post.id);
            if (response.success) {
              const pollOptions = parseSafeJson(post.poll_options);
              const validResults = Array.isArray(response.pollResults) 
                ? response.pollResults.map(r => parseFloat(r) || 0)
                : Array(pollOptions.length).fill(0);

              setPollResults(validResults);
              setTotalVotes(response.totalVotes);
              setUserVoted(response.userVoted === 1);
              if (response.userVoteIndex !== undefined && response.userVoteIndex !== null) {
                setSelectedPollOption(response.userVoteIndex);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao carregar resultados da enquete:', error);
          toast.error('Erro ao carregar resultados da enquete');
        }
      }
    };

    loadPollResults();
  }, [post.id, post.post_type, post.poll_results, post.user_vote_index, post.total_votes, post.user_voted]);

  const handlePollVote = async (optionIndex) => {
    if (isVoting || userVoted) return;

    try {
      setIsVoting(true);
      const response = await Api.voteInPoll(post.id, optionIndex);
      
      if (response.success) {
        // Recarrega os dados do post após o voto
        const postResponse = await Api.getPollResults(post.id);
        if (postResponse.success) {
          const pollOptions = parseSafeJson(post.poll_options);
          const validResults = Array.isArray(postResponse.pollResults) 
            ? postResponse.pollResults.map(r => parseFloat(r) || 0)
            : Array(pollOptions.length).fill(0);

          setSelectedPollOption(optionIndex);
          setPollResults(validResults);
          setTotalVotes(postResponse.totalVotes);
          setUserVoted(true);
          
          // Atualizar o post com os novos resultados
          post.poll_results = JSON.stringify(validResults);
          post.pollResults = validResults;
          post.total_votes = postResponse.totalVotes;
          post.user_voted = 1;
          post.user_vote_index = optionIndex;
        } else {
          toast.error('Erro ao atualizar resultados da enquete');
        }
      } else {
        toast.error(response.message || 'Erro ao votar na enquete');
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
      toast.error(error.message || 'Erro ao registrar voto');
    } finally {
      setIsVoting(false);
    }
  };

  const handleQuizResponse = (questionIndex, optionIndex) => {
    setQuizResponses(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await Api.submitQuizResponses(post.id, Object.values(quizResponses));
      if (response.success) {
        console.log('Quiz enviado com sucesso!', response.score);
      }
    } catch (error) {
      console.error('Erro ao enviar quiz:', error);
    }
  };

  const handleUnlockContent = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setIsUnlocked(true);
    setShowPaymentModal(false);
  };

  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return `R$ ${Number(price).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const renderPaidContentOverlay = () => {
    // Se o post for pago e não estiver desbloqueado, mostra apenas a prévia
    return (
      <div className="post-content-wrapper">
        {post.preview_media_url ? (
          <div className="preview-media">
            {post.preview_media_type === 'image' && (
              <img
                src={`${Environment.API_BASE}/posts/media/${post.preview_media_url}`}
                alt="Preview"
                className="post-image blur-preview"
              />
            )}
            {post.preview_media_type === 'video' && (
              <video
                src={`${Environment.API_BASE}/posts/media/${post.preview_media_url}`}
                className="post-video blur-preview"
                muted
                loop
                autoPlay
              />
            )}
          </div>
        ) : (
          // Se não houver prévia, mostra um placeholder
          <div className="preview-placeholder">
            <img
              src="/images/content-preview.jpg"
              alt="Content Preview"
              className="post-image blur-preview"
            />
          </div>
        )}
        <div className="paid-content-overlay">
          <div className="paid-content-info">
            <Lock size={32} />
            <h3>Conteúdo Exclusivo</h3>
            <p>Desbloqueie este conteúdo por {formatPrice(post.price)}</p>
            <button className="unlock-button" onClick={handleUnlockContent}>
              Desbloquear Conteúdo
            </button>
          </div>
        </div>
      </div>
    );
  };

  const parseSafeJson = (jsonString, defaultValue = []) => {
    try {
      if (!jsonString) return defaultValue;
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (error) {
      console.error('Erro ao fazer parse do JSON:', error);
      return defaultValue;
    }
  };

  const renderMedia = () => {
    if (!post.media_url) return null;

    switch (post.media_type) {
      case 'image':
        return (
          <img
            src={`${Environment.API_BASE}/posts/media/${post.media_url}`}
            alt="Post content"
            className="post-image"
          />
        );

      case 'video':
        return (
          <div className="post-video-container">
            <video
              ref={videoRef}
              src={`${Environment.API_BASE}/posts/media/${post.media_url}`}
              className="post-video"
              controls={isPlaying}
              muted
              loop
              playsInline
              onClick={handlePlay}
            />
            {!isPlaying && (
              <button
                className="video-play-button"
                onClick={handlePlay}
              >
                <Play size={24} />
              </button>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="post-audio-container">
            <audio
              ref={audioRef}
              src={`${Environment.API_BASE}/posts/media/${post.media_url}`}
              controls
              className="post-audio"
            />
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const loadQuizResults = async () => {
      if (post.post_type === 'quiz') {
        try {
          const response = await Api.getQuizResults(post.id);
          if (response.success) {
            setQuizResults(response);
            setHasSubmittedQuiz(response.questions.some(q => q.userResponse !== undefined));
          }
        } catch (error) {
          console.error('Erro ao carregar resultados do quiz:', error);
          toast.error('Erro ao carregar resultados do quiz');
        }
      }
    };

    loadQuizResults();
  }, [post.id, post.post_type]);

  const handleQuizAnswer = (questionIndex, answer) => {
    if (hasSubmittedQuiz || isSubmittingQuiz) return;
    
    setSelectedQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleQuizSubmit = async () => {
    if (hasSubmittedQuiz || isSubmittingQuiz) return;

    const quizQuestions = JSON.parse(post.quiz_questions || '[]');
    if (Object.keys(selectedQuizAnswers).length !== quizQuestions.length) {
      toast.error('Por favor, responda todas as questões');
      return;
    }

    try {
      setIsSubmittingQuiz(true);
      const responses = quizQuestions.map((_, index) => selectedQuizAnswers[index]);
      const response = await Api.submitQuiz(post.id, responses);

      if (response.success) {
        setQuizResults(await Api.getQuizResults(post.id));
        setHasSubmittedQuiz(true);
        toast.success(`Quiz completado! Você acertou ${response.correct_answers} de ${response.total_questions} questões`);
      }
    } catch (error) {
      console.error('Erro ao enviar respostas:', error);
      toast.error(error.message || 'Erro ao enviar respostas');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const renderQuizContent = () => {
    if (!post.quiz_questions) return null;

    const questions = JSON.parse(post.quiz_questions);
    const quizEnded = quizResults?.quiz_ended;
    const showResults = hasSubmittedQuiz || quizEnded;

    return (
      <div className="quiz-container">
        <h4>Quiz</h4>
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="quiz-question">
            <p className="question-text">{question.question}</p>
            <div className="options-container">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedQuizAnswers[questionIndex] === optionIndex;
                const userResponse = quizResults?.questions[questionIndex]?.userResponse;
                const correctOption = quizResults?.questions[questionIndex]?.correctOption;
                const statistics = quizResults?.questions[questionIndex]?.statistics[optionIndex];
                
                let optionClass = 'quiz-option';
                if (showResults) {
                  if (userResponse === optionIndex) optionClass += ' selected';
                  if (correctOption === optionIndex) optionClass += ' correct';
                  if (userResponse === optionIndex && userResponse !== correctOption) {
                    optionClass += ' incorrect';
                  }
                } else if (isSelected) {
                  optionClass += ' selected';
                }

                return (
                  <button
                    key={optionIndex}
                    className={optionClass}
                    onClick={() => handleQuizAnswer(questionIndex, optionIndex)}
                    disabled={showResults}
                  >
                    <div className="option-content">
                      <span className="option-text">{option}</span>
                      {showResults && statistics && (
                        <span className="option-stats">
                          {statistics.percentage.toFixed(1)}% ({statistics.count})
                        </span>
                      )}
                    </div>
                    {showResults && (
                      <div 
                        className="option-bar" 
                        style={{ width: `${statistics?.percentage || 0}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!showResults && (
          <button
            style={{display: Object.keys(selectedQuizAnswers).length !== questions.length ? 'none' : 'block'}}
            className="submit-quiz-button"
            onClick={handleQuizSubmit}
            disabled={isSubmittingQuiz || Object.keys(selectedQuizAnswers).length !== questions.length}
          >
            {isSubmittingQuiz ? 'Enviando...' : 'Enviar Respostas'}
          </button>
        )}

        {showResults && (
          <div className="quiz-results">
            <div className="results-summary">
              {quizResults.user_score !== undefined && (
                <p className="user-score">
                  Sua pontuação: {quizResults.user_score} de {quizResults.total_questions}
                </p>
              )}
              <p className="average-score">
                Média geral: {quizResults.average_score}
              </p>
              <p className="total-responses">
                Total de respostas: {quizResults.total_responses}
              </p>
            </div>
            {post.quiz_end_date && (
              <p className="quiz-end-date">
                {quizEnded 
                  ? `Quiz encerrado em ${new Date(post.quiz_end_date).toLocaleDateString()}`
                  : `Encerra em: ${new Date(post.quiz_end_date).toLocaleDateString()}`
                }
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPostContent = () => {
    if (post.is_paid && !isUnlocked) {
      return renderPaidContentOverlay();
    }

    switch (post.post_type) {
      case 'poll':
        const pollOptions = parseSafeJson(post?.poll_options);
        if (!pollOptions || !Array.isArray(pollOptions) || pollOptions.length === 0) {
          return (
            <div className="post-content-wrapper">
              {renderMedia()}
            </div>
          );
        }

        // Garantir que pollResults seja um array válido do mesmo tamanho que pollOptions
        const currentPollResults = Array.isArray(pollResults) && pollResults.length === pollOptions.length
          ? pollResults.map(r => parseFloat(r) || 0)
          : Array(pollOptions.length).fill(0);

        return (
          <div className="post-content-wrapper">
            {renderMedia()}
            <div className="post-poll">
              <h4>Enquete</h4>
              {pollOptions.map((option, index) => {
                const percentage = currentPollResults[index];
                return (
                  <button
                    key={index}
                    className={`poll-option ${selectedPollOption === index ? 'selected' : ''}`}
                    onClick={() => handlePollVote(index)}
                    disabled={userVoted}
                  >
                    <div className="poll-option-content">
                      <span className="poll-option-text">{option}</span>
                      {userVoted && (
                        <span className="poll-option-percentage">
                          {percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {userVoted && (
                      <div 
                        className="poll-option-bar" 
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                  </button>
                );
              })}
              {post.poll_end_date != null ? (
                <div className="poll-footer">
                  <p className="poll-end-date">
                    Encerra em: {new Date(post.poll_end_date).toLocaleDateString()}
                  </p>
                  {userVoted && (
                    <p className="poll-total-votes">
                      {totalVotes || 0} {totalVotes === 1 ? 'voto' : 'votos'}
                    </p>
                  )}
                </div>
              ) : (
                userVoted && (
                  <div className="poll-footer">
                    <p className="poll-end-date">&nbsp;</p>
                    <p className="poll-total-votes">
                      {totalVotes || 0} {totalVotes === 1 ? 'voto' : 'votos'}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="post-content-wrapper">
            {renderMedia()}
            {renderQuizContent()}
          </div>
        );

      case 'challenge':
        return (
          <div className="post-content-wrapper">
            {renderMedia()}
            <div className="post-challenge">
              <h4>Desafio</h4>
              <p className="challenge-description">{post.challenge_description}</p>
              {post.challenge_reward && (
                <div className="challenge-reward">
                  <Award size={20} />
                  <span>Recompensa: {post.challenge_reward}</span>
                </div>
              )}
              {post.challenge_end_date && (
                <p className="challenge-end-date">
                  Termina em: {new Date(post.challenge_end_date).toLocaleDateString()}
                </p>
              )}
              <button className="participate-button">
                Participar do Desafio
              </button>
            </div>
          </div>
        );

      case 'regular':
      default:
        return renderMedia();
    }
  };

  const renderPostTypeIcon = () => {
    // Primeiro verificamos o tipo do post
    switch (post.post_type) {
      case 'poll':
        return <PieChart size={16} />;
      case 'quiz':
        return <HelpCircle size={16} />;
      case 'challenge':
        return <Award size={16} />;
      case 'regular':
      default:
        // Para posts regulares, verificamos o tipo de mídia
        switch (post.media_type) {
          case 'audio':
            return <Mic size={16} />;
          case 'video':
            return <Play size={16} />;
          case 'image':
            return <Image size={16} />;
          default:
            return null;
        }
    }
  };

  // Posicionar dropdown
  useEffect(() => {
    if (openMenuId && menuRef.current && triggerRef.current) {
      const menu = menuRef.current;
      const trigger = triggerRef.current;

      const triggerRect = trigger.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 200;

      let top = triggerRect.bottom + 8;
      let left = triggerRect.right - menuWidth;

      if (top + menuHeight > window.innerHeight) {
        top = triggerRect.top - menuHeight - 8;
      }
      if (left < 8) {
        left = triggerRect.left;
      }
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      menu.style.position = 'fixed';
      menu.style.top = `${Math.max(8, top)}px`;
      menu.style.left = `${Math.max(8, left)}px`;
      menu.style.zIndex = '99999';
    }
  }, [openMenuId]);

  // Fechar menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target) && !triggerRef.current?.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleScroll = () => {
      if (openMenuId) setOpenMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openMenuId]);

  const renderComments = () => {
    if (!showComments) return null;

    return (
      <div className="comments-section">
        <form className="comment-input" onSubmit={handleAddComment}>
          <img
            src={user?.avatar ? Api.getImageUrl(user.avatar) : '/images/default-avatar.png'}
            alt="Seu avatar"
            className="comment-avatar"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="comment-field"
          />
          <button
            type="submit"
            className="comment-submit-button"
            disabled={!newComment.trim()}
          >
            <Send size={15} />
          </button>
        </form>

        {isLoadingComments ? (
          <div className="comments-loading">Carregando comentários...</div>
        ) : (
          <div className="comments-list">
            {comments?.map(comment => (
              <div key={comment.id} className="comment">
                <img
                  src={comment.avatar ? Api.getImageUrl(comment.avatar) : '/images/default-avatar.png'}
                  alt={comment.username}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.username}</span>
                    <span className="comment-time">{formatRelativeTime(comment.created_at)}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
                {(comment.is_owner === 1 || post.user_id === user.id) && (
                  <button
                    className="comment-delete-button"
                    onClick={() => handleRemoveComment(comment.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <>
      <article className="post fade-in">
        {/* Post Header */}
        <header className="post-header">
          <div className="post-author">
            <img
              src={post.avatar?.includes('users/image') ? post.avatar : Api.getImageUrl(post.avatar)}
              alt={post.username}
              className="author-avatar"
            />
            <div className="author-info">
              <div className="author-name-container">
                <h3 className="author-name">{post.username}</h3>
                {post.is_paid && (
                  <span className="post-paid-badge">
                    <DollarSign size={14} />
                  </span>
                )}
                {renderPostTypeIcon()}
              </div>
              <span className="post-time">{formatRelativeTime(post.created_at)}</span>
            </div>
          </div>

          <button
            ref={triggerRef}
            className="btn btn-ghost btn-icon"
            onClick={handleMenuToggle}
            aria-label="Opções do post"
          >
            <MoreHorizontal size={20} />
          </button>
        </header>

        {/* Post Content */}
        <div className="post-content">
          {post.content && (
            <p className="post-description">{post.content}</p>
          )}

          {/* Media Content */}
          <div className="post-media">
            {renderPostContent()}
          </div>
        </div>

        {/* Post Actions */}
        {(!post.is_paid || post.allow_comments) && (
          <div className="post-actions">
            <button 
              className={`btn btn-ghost btn-icon ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <Heart 
                size={20} 
                fill={isLiked ? "var(--primary-color)" : "none"} 
                color={isLiked ? "var(--primary-color)" : "currentColor"}
                strokeWidth={2}
              />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            {post.allow_comments && (
              <button
                className={`action-button ${showComments ? 'active' : ''}`}
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle size={24} />
                <span>{commentsCount}</span>
              </button>
            )}

            <button
              className="action-button"
              onClick={handleGiftClick}
            >
              <Gift size={20} />
            </button>

            <button
              className={`btn btn-ghost btn-icon ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
            >
              <Bookmark 
                size={20} 
                fill={isSaved ? "var(--primary-color)" : "none"}
                color={isSaved ? "var(--primary-color)" : "currentColor"}
              />
            </button>
          </div>
        )}

        {renderComments()}

        {/* Dropdown Menu */}
        {openMenuId === post.id && (
          <div
            ref={menuRef}
            className="post-dropdown-menu"
            style={{
              position: 'absolute',
              top: triggerRef.current ? triggerRef.current.offsetTop + triggerRef.current.offsetHeight : 0,
              right: triggerRef.current ? triggerRef.current.offsetLeft : 0,
              zIndex: 1000
            }}
          >
            <button
              className="post-menu-item"
              onClick={(e) => handleMenuAction('copy', e)}
            >
              <Copy size={16} />
              Copiar link
            </button>
            <button
              className="post-menu-item"
              onClick={(e) => handleMenuAction('collection', e)}
            >
              <Bookmark size={16} />
              {isSaved ? `Remover da coleção` : `Adicionar à coleção`}
            </button>
            <div className="post-menu-divider" />
            {post?.is_owner == 1 ? (
              <button
                className="post-menu-item  post-menu-item-danger"
                onClick={(e) => handleMenuAction('delete', e)}
              >
                <Trash size={16} />
                Deletar post
              </button>
            ) : (
              <>
                {/*<button
                  className="post-menu-item"
                  onClick={(e) => handleMenuAction('hide', e)}
                >
                  <EyeOff size={16} />
                  Ocultar post
                </button>*/}
                <button
                  className="post-menu-item post-menu-item-danger"
                  onClick={(e) => handleMenuAction('report', e)}
                >
                  <Flag size={16} />
                  Denunciar
                </button>
              </>
            )}
          </div>
        )}
      </article>

      {/* Gift Modal */}
      <GiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        post={post}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        post={post}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default Post;