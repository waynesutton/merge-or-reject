import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { ArrowLeft, Star, Clock3, Hash, BookOpen, Lock, Unlock, Globe, Copy, LogOut, Trophy } from 'lucide-react';
import { UserProfile, LANGUAGES, BADGES } from '../types';

interface ProfilePageProps {
  profile: UserProfile;
  onBack: () => void;
  isOwnProfile?: boolean;
  isDarkMode: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onBack, isOwnProfile = false, isDarkMode }) => {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate);
  const profileUrl = `${window.location.origin}/${profile.profileUrl}`;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handlePrivacyToggle = () => {
    setIsPrivate(!isPrivate);
    // This will be implemented when we add the database
    console.log('Privacy toggled:', !isPrivate);
  };

  const copyProfileUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    // You could add a toast notification here
    alert('Profile URL copied to clipboard!');
  };

  const earnedBadges = BADGES.filter(badge => profile.earnedBadges.includes(badge.id));
  const nextBadge = BADGES.find(badge => badge.requiredGames > profile.totalGames);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl">{profile.firstName}'s Profile</h1>
      </div>

      {/* Profile Overview */}
      <div className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} rounded-lg p-6 mb-8 shadow-lg`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl">{profile.username}</h2>
              {isPrivate ? (
                <Lock className="w-4 h-4 text-gray-400" />
              ) : (
                <Globe className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Joined {new Date(profile.joinedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <div className="text-center">
              <p className="text-3xl text-[#00FF94]">{profile.totalGames}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Games</p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-[#00FF94]">
                {profile.averageScore.toFixed(1)}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</p>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} pt-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0`}>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrivacyToggle}
                className={`flex items-center space-x-2 px-4 py-2 ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                } rounded-lg transition-colors`}
              >
                {isPrivate ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Private Profile</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Public Profile</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className={`${
                  isDarkMode ? 'bg-black/30' : 'bg-gray-100'
                } px-3 py-2 rounded-lg text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                } w-64`}
              />
              <button
                onClick={copyProfileUrl}
                className="p-2 hover:text-[#00FF94] transition-colors"
                title="Copy profile URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className={`${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'} rounded-lg p-6 mb-8 shadow-lg`}>
        <h2 className="text-xl mb-6">Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {earnedBadges.map(badge => (
            <div
              key={badge.id}
              className={`${
                isDarkMode ? 'bg-black/30' : 'bg-gray-100'
              } p-4 rounded-lg flex items-center space-x-3`}
            >
              <div className="text-3xl">{badge.emoji}</div>
              <div>
                <h3 className="text-[#00FF94]">{badge.name}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{badge.description}</p>
              </div>
            </div>
          ))}
        </div>

        {nextBadge && (
          <div className={`mt-6 p-4 ${isDarkMode ? 'bg-black/30' : 'bg-gray-100'} rounded-lg`}>
            <h3 className="text-lg mb-2">Next Badge</h3>
            <div className="flex items-center space-x-3">
              <div className="text-3xl opacity-50">{nextBadge.emoji}</div>
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{nextBadge.name}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Play {nextBadge.requiredGames - profile.totalGames} more games to unlock
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Language Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.stats.map((stat) => (
          <div
            key={stat.language}
            className={`${
              isDarkMode ? 'bg-[#1A1A1A] hover:bg-[#242424]' : 'bg-white hover:bg-gray-50'
            } rounded-lg p-6 transition-colors shadow-lg`}
          >
            <h3 className="text-xl mb-4">{LANGUAGES[stat.language]}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Trophy className="w-4 h-4" />
                  <span>Highest Score</span>
                </div>
                <span className="text-[#00FF94]">{stat.highestScore}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Star className="w-4 h-4" />
                  <span>Average Score</span>
                </div>
                <span>{stat.averageScore.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Hash className="w-4 h-4" />
                  <span>Games Played</span>
                </div>
                <span>{stat.gamesPlayed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <BookOpen className="w-4 h-4" />
                  <span>Volumes Completed</span>
                </div>
                <div className="flex gap-1">
                  {stat.volumes.map((vol) => (
                    <span
                      key={vol}
                      className="inline-flex items-center justify-center w-6 h-6 text-xs text-black bg-[#00FF94] rounded"
                    >
                      {vol}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock3 className="w-4 h-4" />
                  <span>Last Played</span>
                </div>
                <span className="text-sm">
                  {new Date(stat.lastPlayed).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage