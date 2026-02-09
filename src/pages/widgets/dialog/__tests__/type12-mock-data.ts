/**
 * Type 12 - HRE Recommendation Widget Mock 数据
 *
 * 提供多种场景的测试数据
 */

import type { HRERecommendationData } from '../Type12_HRERecommendationWidgetPage'

/**
 * 视频推荐（有匹配）
 */
export const mockVideoRecommendation: HRERecommendationData = {
  hre_recommendations: [{
    content_id: '697c7ee5492c5a6580b1fe85',
    type: 'video',
    content_type: 'exercise',
    image_url: 'https://cdn.fulai.tech/comm/image/1769750270125_456l864te',
    url: 'https://cdn.fulai.tech/comm/video/1769749075286_73302i411',
    minutes: 15,
    title: 'Gentle 5-Minute Move',
    explanation_text: 'Knees bent, arm swing, leg kick, waist twist, ankle rotation, stretch & breathe.',
    detailed_text: 'As someone with gout and blood sugar concerns, this easy workout is great for you! It gets your blood flowing gently—bend knees, swing arms, twist waist, and stretch with slow breaths. No heavy lifting, just simple movements to wake your body, boost energy, and help with blood sugar control. Even 5 minutes a day can make a difference!',
    has_match: true,
    rank: 1,
    total_count: 1,
  }],
}

/**
 * 音频推荐（有匹配）
 */
export const mockAudioRecommendation: HRERecommendationData = {
  hre_recommendations: [{
    content_id: '697c7ee5492c5a6580b1fe84',
    type: 'audio',
    content_type: 'music',
    image_url: 'https://cdn.fulai.tech/comm/image/1769753468298_6p260y4w2',
    url: 'https://cdn.fulai.tech/comm/audio/1769750515181_v7u3s0u0r',
    minutes: 10,
    title: 'Calming Piano for Sleep',
    explanation_text: 'Soft piano melodies designed to help you relax and fall asleep.',
    detailed_text: 'This soothing piano collection was composed specifically for pre-sleep relaxation. The gentle melodies help slow your heart rate and ease you into a peaceful state of mind. Listen for 10 minutes before bed for best results.',
    has_match: true,
    rank: 1,
    total_count: 1,
  }],
}

/**
 * 图文推荐（有匹配，无时长）
 */
export const mockImageTextRecommendation: HRERecommendationData = {
  hre_recommendations: [{
    content_id: '697c8fea20893f07ae8446d6',
    type: 'image_text',
    content_type: 'food',
    image_url: 'https://cdn.fulai.tech/comm/image/1770002408907_e88632c0b',
    url: '',
    title: 'Low-Sodium Meal Plan',
    explanation_text: 'A carefully designed meal plan to help manage your sodium intake.',
    detailed_text: 'Based on your recent blood pressure readings, reducing sodium intake is recommended. This meal plan includes fresh vegetables, lean proteins, and whole grains. Aim for less than 2,300mg of sodium per day. Try steaming or grilling instead of frying.',
    has_match: true,
    rank: 1,
    total_count: 1,
  }],
}

/**
 * 纯文本推荐（无匹配，LLM 生成的文字内容）
 */
export const mockTextOnlyRecommendation: HRERecommendationData = {
  hre_recommendations: [{
    title: 'Take a Short Walk',
    explanation_text: 'A 10-minute walk after meals can help regulate blood sugar levels and improve digestion.',
    detailed_text: 'Research shows that even a brief walk after eating can significantly reduce post-meal blood sugar spikes. Try walking for 10-15 minutes after your main meals. Choose a comfortable pace and enjoy the fresh air.',
    has_match: false,
    rank: 1,
    total_count: 1,
  }],
}

/**
 * 空推荐列表
 */
export const mockEmptyRecommendation: HRERecommendationData = {
  hre_recommendations: [],
}

/**
 * 多条推荐（一期只取 rank=1 的首个）
 */
export const mockMultipleRecommendations: HRERecommendationData = {
  hre_recommendations: [
    {
      content_id: '697c7ee5492c5a6580b1fe84',
      type: 'audio',
      content_type: 'music',
      image_url: 'https://cdn.fulai.tech/comm/image/1769753468298_6p260y4w2',
      url: 'https://cdn.fulai.tech/comm/audio/1769750515181_v7u3s0u0r',
      minutes: 10,
      title: 'Calming Piano for Sleep',
      explanation_text: 'Soft piano melodies designed to help you relax and fall asleep.',
      detailed_text: 'This soothing piano collection was composed specifically for pre-sleep relaxation. The gentle melodies help slow your heart rate and ease you into a peaceful state of mind. Listen for 10 minutes before bed for best results.',
      has_match: true,
      rank: 2,
      total_count: 3,
    },
    {
      content_id: '697c7ee5492c5a6580b1fe85',
      type: 'video',
      content_type: 'exercise',
      image_url: 'https://cdn.fulai.tech/comm/image/1769750270125_456l864te',
      url: 'https://cdn.fulai.tech/comm/video/1769749075286_73302i411',
      minutes: 15,
      title: 'Gentle 5-Minute Move',
      explanation_text: 'Knees bent, arm swing, leg kick, waist twist, ankle rotation, stretch & breathe.',
      detailed_text: 'As someone with gout and blood sugar concerns, this easy workout is great for you! It gets your blood flowing gently—bend knees, swing arms, twist waist, and stretch with slow breaths. No heavy lifting, just simple movements to wake your body, boost energy, and help with blood sugar control. Even 5 minutes a day can make a difference!',
      has_match: true,
      rank: 1,
      total_count: 3,
    },
    {
      content_id: '697c8fea20893f07ae8446d6',
      type: 'image_text',
      content_type: 'food',
      image_url: 'https://cdn.fulai.tech/comm/image/1770002408907_e88632c0b',
      url: '',
      title: 'Low-Sodium Meal Plan',
      explanation_text: 'A carefully designed meal plan to help manage your sodium intake.',
      detailed_text: 'Based on your recent blood pressure readings, reducing sodium intake is recommended. This meal plan includes fresh vegetables, lean proteins, and whole grains. Aim for less than 2,300mg of sodium per day. Try steaming or grilling instead of frying.',
      has_match: true,
      rank: 3,
      total_count: 3,
    },
  ],
}

/**
 * JSON 字符串格式的数据（模拟 NativeBridge 传入）
 */
export const mockVideoRecommendationJSON = JSON.stringify(mockVideoRecommendation)
export const mockTextOnlyRecommendationJSON = JSON.stringify(mockTextOnlyRecommendation)
