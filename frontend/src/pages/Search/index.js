import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import Header from '../../components/Header';
import BottomTabNavigation from '../../components/BottomTabNavigation';
import ProfileBannerItem from '../../components/ProfileBannerItem';
import './style.css';

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recommendedProfiles, setRecommendedProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef(null);

    // Mock data para perfis recomendados
    const mockRecommendedProfiles = [
        {
            id: 1,
            name: "feercampos",
            username: "feercampos",
            avatar: "https://picsum.photos/40/40?random=201",
            coverImage: "https://picsum.photos/300/120?random=301",
            isVerified: true
        },
        {
            id: 2,
            name: "BAD MI",
            username: "badmi",
            avatar: "https://picsum.photos/40/40?random=202",
            coverImage: "https://picsum.photos/300/120?random=302",
            isVerified: false
        },
        {
            id: 3,
            name: "Mel Hotw...",
            username: "melhotw",
            avatar: "https://picsum.photos/40/40?random=203",
            coverImage: "https://picsum.photos/300/120?random=303",
            isVerified: true
        },
        {
            id: 4,
            name: "Marina Silva",
            username: "marina_s",
            avatar: "https://picsum.photos/40/40?random=204",
            coverImage: "https://picsum.photos/300/120?random=304",
            isVerified: false
        },
        {
            id: 5,
            name: "Luana Costa",
            username: "luana_c",
            avatar: "https://picsum.photos/40/40?random=205",
            coverImage: "https://picsum.photos/300/120?random=305",
            isVerified: true
        },
        {
            id: 6,
            name: "Camila Santos",
            username: "cami_santos",
            avatar: "https://picsum.photos/40/40?random=206",
            coverImage: "https://picsum.photos/300/120?random=306",
            isVerified: false
        },
        {
            id: 7,
            name: "Ana Paula",
            username: "ana_paula",
            avatar: "https://picsum.photos/40/40?random=207",
            coverImage: "https://picsum.photos/300/120?random=307",
            isVerified: true
        },
        {
            id: 8,
            name: "Roberto Lima",
            username: "roberto_l",
            avatar: "https://picsum.photos/40/40?random=208",
            coverImage: "https://picsum.photos/300/120?random=308",
            isVerified: false
        },
        {
            id: 9,
            name: "Carla Mendes",
            username: "carla_m",
            avatar: "https://picsum.photos/40/40?random=209",
            coverImage: "https://picsum.photos/300/120?random=309",
            isVerified: true
        },
        {
            id: 10,
            name: "Pedro Oliveira",
            username: "pedro_o",
            avatar: "https://picsum.photos/40/40?random=210",
            coverImage: "https://picsum.photos/300/120?random=310",
            isVerified: false
        },
        {
            id: 11,
            name: "Julia Santos",
            username: "julia_s",
            avatar: "https://picsum.photos/40/40?random=211",
            coverImage: "https://picsum.photos/300/120?random=311",
            isVerified: true
        },
    ];

    // Foco no input quando o componente montar
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRecommendedProfiles(mockRecommendedProfiles);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = recommendedProfiles.filter(profile =>
                profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                profile.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProfiles(filtered);
        } else {
            // Esvazia o array quando não há termo de busca
            setFilteredProfiles([]);
        }
    }, [searchTerm, recommendedProfiles]);

    return (
        <div className="search-page">
            <Header />

            <div className="search-header">
                <div className="search-input-container">
                    <SearchIcon className="search-icon" size={20} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar criadores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchTerm('')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="search-content">
                {!searchTerm && !loading && (
                    <div className="section-header">
                        <h2>Buscar Criadores</h2>
                        <p>Digite no campo acima para encontrar criadores</p>
                    </div>
                )}

                {searchTerm && !loading && (
                    <div className="section-header">
                        <h2>Resultados da Busca</h2>
                        <p>{filteredProfiles.length} criador(es) encontrado(s)</p>
                    </div>
                )}

                {loading && (
                    <div className="search-loading">
                        <div className="loading-spinner"></div>
                        <p>Carregando criadores...</p>
                    </div>
                )}

                {!loading && searchTerm && filteredProfiles.length === 0 && (
                    <div className="no-results">
                        <SearchIcon size={48} />
                        <h3>Nenhum criador encontrado</h3>
                        <p>Tente buscar por outros termos</p>
                    </div>
                )}

                {!loading && filteredProfiles.length > 0 && (
                    filteredProfiles.map((profile) => (
                        <ProfileBannerItem key={`${profile.id}-${profile.username}`} profile={profile} />
                    ))
                )}
            </div>

            <BottomTabNavigation />
        </div>
    );
};

export default Search;