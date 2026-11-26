export interface SubtopicVideoOption {
  title: string;
  channel: string;
  language: 'English' | 'Hindi' | 'English / Hindi';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  url: string;
  verifiedStatus: 'Verified Playlist' | 'Topic Search';
  kind: 'tutorial' | 'playlist';
}

function ytSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/**
 * Maps a subtopic/topic cleanly to real verified channel playlists + topic-specific
 * YouTube search URLs (no fabricated video IDs) in both English and Hindi.
 */
export function getSubtopicYouTubeLessons(
  topicTitle: string,
  subtopicTitle: string,
  level: 'Beginner' | 'Intermediate' | 'Advanced'
): {
  englishTutorial: SubtopicVideoOption;
  hindiTutorial: SubtopicVideoOption;
  completePlaylist: SubtopicVideoOption;
} {
  const hay = `${topicTitle} ${subtopicTitle}`.toLowerCase();
  const cleanTopic = subtopicTitle.replace(/^\d+\.\s*/, '');

  let engChannel = 'freeCodeCamp';
  let hindiChannel = 'CodeWithHarry';
  let playlistChannel = 'freeCodeCamp';
  let playlistUrl = 'https://www.youtube.com/@freecodecamp';
  let playlistVerified: 'Verified Playlist' | 'Topic Search' = 'Verified Playlist';

  if (hay.includes('dsa') || hay.includes('array') || hay.includes('tree') || hay.includes('graph') || hay.includes('dp') || hay.includes('dynamic programming') || hay.includes('pointer') || hay.includes('binary search') || hay.includes('heap') || hay.includes('trie') || hay.includes('recursion')) {
    engChannel = 'NeetCode';
    hindiChannel = 'takeUforward (Striver)';
    playlistChannel = 'takeUforward (Striver A2Z)';
    playlistUrl = 'https://www.youtube.com/@takeUforward';
  } else if (hay.includes('dbms') || hay.includes('acid') || hay.includes('b+ tree') || hay.includes('normalization')) {
    engChannel = 'freeCodeCamp';
    hindiChannel = 'Gate Smashers';
    playlistChannel = 'Gate Smashers DBMS';
    playlistUrl = 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y';
  } else if (hay.includes('operating system') || hay.includes('process') || hay.includes('paging') || hay.includes('deadlock') || hay.includes('scheduling')) {
    engChannel = 'freeCodeCamp';
    hindiChannel = 'Gate Smashers';
    playlistChannel = 'Gate Smashers OS';
    playlistUrl = 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p';
  } else if (hay.includes('network') || hay.includes('tcp') || hay.includes('osi') || hay.includes('dns') || hay.includes('http') || hay.includes('subnet')) {
    engChannel = 'freeCodeCamp';
    hindiChannel = 'Gate Smashers';
    playlistChannel = 'Gate Smashers CN';
    playlistUrl = 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_';
  } else if (hay.includes('java') || hay.includes('spring') || hay.includes('oop') || hay.includes('solid')) {
    engChannel = 'Kunal Kushwaha';
    hindiChannel = 'Apna College';
    playlistChannel = 'Kunal Kushwaha Java';
    playlistUrl = 'https://www.youtube.com/@KunalKushwaha';
  } else if (hay.includes('sql') || hay.includes('pandas') || hay.includes('excel') || hay.includes('power bi') || hay.includes('tableau') || hay.includes('stats') || hay.includes('hypothesis') || hay.includes('a/b')) {
    engChannel = 'Alex The Analyst';
    hindiChannel = 'CodeWithHarry';
    playlistChannel = 'Alex The Analyst / StatQuest';
    playlistUrl = 'https://www.youtube.com/@AlexTheAnalyst';
  } else if (hay.includes('machine learning') || hay.includes('pytorch') || hay.includes('deep learning') || hay.includes('transformer') || hay.includes('rag') || hay.includes('regression') || hay.includes('nlp')) {
    engChannel = 'StatQuest';
    hindiChannel = 'CodeWithHarry / CampusX';
    playlistChannel = 'StatQuest ML Concepts';
    playlistUrl = 'https://www.youtube.com/@statquest';
  } else if (hay.includes('docker') || hay.includes('kubernetes') || hay.includes('terraform') || hay.includes('aws') || hay.includes('ci/cd')) {
    engChannel = 'freeCodeCamp';
    hindiChannel = 'CodeWithHarry';
    playlistChannel = 'freeCodeCamp Cloud & DevOps';
    playlistUrl = 'https://www.youtube.com/@freecodecamp';
  } else {
    engChannel = 'freeCodeCamp';
    hindiChannel = 'Apna College';
    playlistUrl = ytSearchUrl(`${topicTitle} complete playlist ${engChannel}`);
    playlistVerified = 'Topic Search';
  }

  return {
    englishTutorial: {
      title: `${cleanTopic} — English Video Lesson`,
      channel: engChannel,
      language: 'English',
      level,
      url: ytSearchUrl(`${cleanTopic} ${engChannel} tutorial`),
      verifiedStatus: 'Topic Search',
      kind: 'tutorial',
    },
    hindiTutorial: {
      title: `${cleanTopic} — Hindi / Hinglish Walkthrough`,
      channel: hindiChannel,
      language: 'Hindi',
      level,
      url: ytSearchUrl(`${cleanTopic} ${hindiChannel} hindi tutorial`),
      verifiedStatus: 'Topic Search',
      kind: 'tutorial',
    },
    completePlaylist: {
      title: `${topicTitle} Complete Series`,
      channel: playlistChannel,
      language: 'English / Hindi',
      level,
      url: playlistUrl,
      verifiedStatus: playlistVerified,
      kind: 'playlist',
    },
  };
}
