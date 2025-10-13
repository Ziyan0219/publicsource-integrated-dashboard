#!/usr/bin/env python3
"""
AI-Powered Strategic Analytics for PublicSource
Provides sophisticated insights for newsroom leaders and strategic decision-making
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from collections import defaultdict, Counter
from dataclasses import dataclass
import warnings
warnings.filterwarnings("ignore")

# Import ML and analytics libraries with graceful fallbacks
try:
    from sklearn.cluster import KMeans, DBSCAN
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import LatentDirichletAllocation
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.preprocessing import StandardScaler
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.subplots import make_subplots
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False

@dataclass
class CoverageInsight:
    """Represents a strategic insight about coverage gaps or opportunities"""
    insight_type: str  # 'gap', 'opportunity', 'trend', 'recommendation'
    priority: str      # 'high', 'medium', 'low'
    title: str
    description: str
    affected_areas: List[str]
    metrics: Dict
    recommendation: str
    confidence: float

@dataclass
class StoryPerformancePrediction:
    """Predicted performance metrics for a story"""
    predicted_pageviews: int
    predicted_engagement_rate: float
    viral_probability: float
    community_impact_score: float
    optimal_publish_time: str
    recommended_angle: str
    cross_promotion_opportunities: List[str]

class CoverageGapAnalyzer:
    """Analyzes coverage gaps and underserved communities"""

    def __init__(self, stories_data: List[Dict], enhanced_geo_data: Dict = None):
        self.stories = stories_data
        self.geo_data = enhanced_geo_data or {}
        self.insights = []

    def analyze_demographic_coverage_gaps(self) -> List[CoverageInsight]:
        """Identify demographic and geographic coverage gaps"""
        insights = []

        # Analyze coverage by neighborhood
        neighborhood_coverage = defaultdict(int)
        total_stories = len(self.stories)

        for story in self.stories:
            neighborhoods = story.get('neighborhoods', '')
            if neighborhoods:
                for neighborhood in neighborhoods.split(','):
                    neighborhood = neighborhood.strip()
                    if neighborhood:
                        neighborhood_coverage[neighborhood] += 1

        # Identify underserved areas
        avg_coverage = total_stories / len(neighborhood_coverage) if neighborhood_coverage else 0

        underserved_areas = []
        well_covered_areas = []

        for area, count in neighborhood_coverage.items():
            coverage_ratio = count / avg_coverage if avg_coverage > 0 else 0
            if coverage_ratio < 0.5:  # Less than half average coverage
                underserved_areas.append((area, count, coverage_ratio))
            elif coverage_ratio > 2.0:  # More than double average coverage
                well_covered_areas.append((area, count, coverage_ratio))

        # Generate insights for underserved areas
        if underserved_areas:
            underserved_areas.sort(key=lambda x: x[2])  # Sort by coverage ratio
            top_underserved = underserved_areas[:5]

            insights.append(CoverageInsight(
                insight_type='gap',
                priority='high',
                title='Underserved Neighborhoods Identified',
                description=f'Found {len(underserved_areas)} neighborhoods with below-average coverage',
                affected_areas=[area[0] for area in top_underserved],
                metrics={
                    'total_underserved': len(underserved_areas),
                    'avg_coverage': avg_coverage,
                    'lowest_coverage_areas': [{'area': area[0], 'stories': area[1], 'ratio': area[2]}
                                            for area in top_underserved]
                },
                recommendation=f'Consider increasing coverage in {", ".join([area[0] for area in top_underserved[:3]])}',
                confidence=0.9
            ))

        return insights

    def analyze_temporal_coverage_patterns(self) -> List[CoverageInsight]:
        """Analyze temporal patterns in coverage"""
        insights = []

        # Parse dates and analyze weekly/monthly patterns
        story_dates = []
        for story in self.stories:
            date_str = story.get('date', '')
            if date_str:
                try:
                    date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    story_dates.append(date)
                except:
                    continue

        if len(story_dates) < 10:  # Not enough data
            return insights

        # Analyze weekly patterns
        weekly_pattern = defaultdict(int)
        for date in story_dates:
            weekly_pattern[date.weekday()] += 1

        # Identify days with low coverage
        avg_daily = sum(weekly_pattern.values()) / 7
        low_coverage_days = [day for day, count in weekly_pattern.items() if count < avg_daily * 0.7]

        if low_coverage_days:
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            insights.append(CoverageInsight(
                insight_type='trend',
                priority='medium',
                title='Weekly Coverage Pattern Analysis',
                description=f'Identified {len(low_coverage_days)} days with below-average coverage',
                affected_areas=[],
                metrics={
                    'weekly_pattern': {day_names[day]: count for day, count in weekly_pattern.items()},
                    'low_coverage_days': [day_names[day] for day in low_coverage_days],
                    'avg_daily_stories': avg_daily
                },
                recommendation=f'Consider increasing weekend/holiday coverage on {", ".join([day_names[d] for d in low_coverage_days])}',
                confidence=0.8
            ))

        return insights

    def analyze_topic_coverage_balance(self) -> List[CoverageInsight]:
        """Analyze balance across different story topics/categories"""
        insights = []

        # Analyze umbrella categories
        category_coverage = defaultdict(int)
        for story in self.stories:
            umbrella = story.get('umbrella', '')
            if umbrella:
                category_coverage[umbrella] += 1

        if not category_coverage:
            return insights

        # Calculate coverage distribution
        total_stories = sum(category_coverage.values())
        category_ratios = {cat: count/total_stories for cat, count in category_coverage.items()}

        # Identify over/under represented categories
        avg_ratio = 1.0 / len(category_coverage)
        underrepresented = [(cat, ratio) for cat, ratio in category_ratios.items() if ratio < avg_ratio * 0.5]
        overrepresented = [(cat, ratio) for cat, ratio in category_ratios.items() if ratio > avg_ratio * 2.0]

        if underrepresented or overrepresented:
            insights.append(CoverageInsight(
                insight_type='gap',
                priority='medium',
                title='Topic Coverage Imbalance Detected',
                description=f'Found imbalanced coverage across {len(category_coverage)} categories',
                affected_areas=[],
                metrics={
                    'category_distribution': dict(category_ratios),
                    'underrepresented': [{'category': cat, 'ratio': ratio} for cat, ratio in underrepresented],
                    'overrepresented': [{'category': cat, 'ratio': ratio} for cat, ratio in overrepresented],
                    'balance_score': 1.0 - (max(category_ratios.values()) - min(category_ratios.values()))
                },
                recommendation=f'Consider increasing coverage of {", ".join([cat for cat, _ in underrepresented[:3]])}',
                confidence=0.85
            ))

        return insights

class StoryImpactPredictor:
    """Predicts story performance and optimal publishing strategies"""

    def __init__(self, historical_stories: List[Dict]):
        self.historical_stories = historical_stories
        self.trained_models = {}
        self._analyze_historical_patterns()

    def _analyze_historical_patterns(self):
        """Analyze historical story performance patterns"""
        # Analyze patterns by neighborhood, topic, timing, etc.
        self.neighborhood_performance = defaultdict(list)
        self.topic_performance = defaultdict(list)
        self.timing_performance = defaultdict(list)

        for story in self.historical_stories:
            # Simulate engagement metrics (in real implementation, this would come from analytics)
            simulated_pageviews = self._simulate_pageviews(story)
            simulated_engagement = self._simulate_engagement(story)

            neighborhoods = story.get('neighborhoods', '')
            if neighborhoods:
                for neighborhood in neighborhoods.split(','):
                    neighborhood = neighborhood.strip()
                    if neighborhood:
                        self.neighborhood_performance[neighborhood].append({
                            'pageviews': simulated_pageviews,
                            'engagement': simulated_engagement
                        })

            umbrella = story.get('umbrella', '')
            if umbrella:
                self.topic_performance[umbrella].append({
                    'pageviews': simulated_pageviews,
                    'engagement': simulated_engagement
                })

    def _simulate_pageviews(self, story: Dict) -> int:
        """Simulate pageviews based on story characteristics"""
        base_views = 1000

        # Adjust based on neighborhood (some areas might be more popular)
        neighborhoods = story.get('neighborhoods', '').lower()
        if any(popular in neighborhoods for popular in ['pittsburgh', 'oakland', 'shadyside']):
            base_views += 500

        # Adjust based on topic
        umbrella = story.get('umbrella', '').lower()
        if any(popular in umbrella for popular in ['development', 'council', 'school']):
            base_views += 300

        # Add some randomness
        import random
        return int(base_views * random.uniform(0.7, 1.8))

    def _simulate_engagement(self, story: Dict) -> float:
        """Simulate engagement rate based on story characteristics"""
        base_engagement = 0.05  # 5% base engagement rate

        # Local stories tend to have higher engagement
        neighborhoods = story.get('neighborhoods', '')
        if neighborhoods and ',' not in neighborhoods:  # Single neighborhood focus
            base_engagement += 0.02

        # Add randomness
        import random
        return min(0.20, base_engagement * random.uniform(0.8, 1.5))

    def predict_story_performance(self, story_concept: Dict) -> StoryPerformancePrediction:
        """Predict performance for a new story concept"""

        # Extract features
        neighborhoods = story_concept.get('neighborhoods', [])
        if isinstance(neighborhoods, str):
            neighborhoods = [n.strip() for n in neighborhoods.split(',')]

        topic = story_concept.get('topic', '')
        title = story_concept.get('title', '')

        # Predict based on historical patterns
        predicted_pageviews = self._predict_pageviews(neighborhoods, topic, title)
        predicted_engagement = self._predict_engagement(neighborhoods, topic, title)
        viral_probability = self._predict_viral_probability(title, topic)
        community_impact = self._predict_community_impact(neighborhoods, topic)

        # Determine optimal timing
        optimal_timing = self._determine_optimal_timing(neighborhoods, topic)

        # Suggest angle optimization
        recommended_angle = self._suggest_angle_optimization(title, topic, neighborhoods)

        # Find cross-promotion opportunities
        cross_promotion = self._find_cross_promotion_opportunities(neighborhoods, topic)

        return StoryPerformancePrediction(
            predicted_pageviews=predicted_pageviews,
            predicted_engagement_rate=predicted_engagement,
            viral_probability=viral_probability,
            community_impact_score=community_impact,
            optimal_publish_time=optimal_timing,
            recommended_angle=recommended_angle,
            cross_promotion_opportunities=cross_promotion
        )

    def _predict_pageviews(self, neighborhoods: List[str], topic: str, title: str) -> int:
        """Predict pageviews based on historical patterns"""
        base_prediction = 1200

        # Neighborhood factor
        neighborhood_multiplier = 1.0
        for neighborhood in neighborhoods:
            if neighborhood in self.neighborhood_performance:
                avg_views = np.mean([p['pageviews'] for p in self.neighborhood_performance[neighborhood]])
                neighborhood_multiplier *= (avg_views / 1000)  # Normalize to base

        # Topic factor
        topic_multiplier = 1.0
        if topic in self.topic_performance:
            avg_views = np.mean([p['pageviews'] for p in self.topic_performance[topic]])
            topic_multiplier = avg_views / 1000

        # Title factor (simple heuristics)
        title_multiplier = 1.0
        if any(keyword in title.lower() for keyword in ['breaking', 'exclusive', 'investigation']):
            title_multiplier += 0.3
        if any(keyword in title.lower() for keyword in ['council', 'meeting', 'development']):
            title_multiplier += 0.2

        return int(base_prediction * neighborhood_multiplier * topic_multiplier * title_multiplier)

    def _predict_engagement(self, neighborhoods: List[str], topic: str, title: str) -> float:
        """Predict engagement rate"""
        base_engagement = 0.06

        # Local focus increases engagement
        if len(neighborhoods) == 1:
            base_engagement += 0.02

        # Certain topics drive engagement
        if any(keyword in topic.lower() for keyword in ['school', 'housing', 'development']):
            base_engagement += 0.015

        return min(0.25, base_engagement)

    def _predict_viral_probability(self, title: str, topic: str) -> float:
        """Predict probability of story going viral"""
        viral_score = 0.1  # Base 10% chance

        # Certain topics/titles have higher viral potential
        if any(keyword in title.lower() for keyword in ['controversy', 'scandal', 'breakthrough']):
            viral_score += 0.3
        if any(keyword in topic.lower() for keyword in ['development', 'politics']):
            viral_score += 0.15

        return min(0.8, viral_score)

    def _predict_community_impact(self, neighborhoods: List[str], topic: str) -> float:
        """Predict community impact score"""
        impact_score = 0.5

        # Local stories have higher community impact
        if neighborhoods:
            impact_score += 0.3

        # Certain topics have high community relevance
        if any(keyword in topic.lower() for keyword in ['housing', 'school', 'transportation']):
            impact_score += 0.2

        return min(1.0, impact_score)

    def _determine_optimal_timing(self, neighborhoods: List[str], topic: str) -> str:
        """Determine optimal publish timing"""
        # Simple heuristics (in real system, this would use historical engagement data)
        if any(keyword in topic.lower() for keyword in ['council', 'government']):
            return "Tuesday-Thursday 9-11 AM"
        elif neighborhoods:
            return "Wednesday-Friday 7-9 AM"
        else:
            return "Tuesday-Thursday 8-10 AM"

    def _suggest_angle_optimization(self, title: str, topic: str, neighborhoods: List[str]) -> str:
        """Suggest angle optimization for better engagement"""
        suggestions = []

        if neighborhoods:
            suggestions.append(f"Focus on impact to {neighborhoods[0]} residents")

        if any(keyword in topic.lower() for keyword in ['development', 'housing']):
            suggestions.append("Emphasize economic impact and timeline")

        if not suggestions:
            suggestions.append("Add human interest angle and local voices")

        return "; ".join(suggestions)

    def _find_cross_promotion_opportunities(self, neighborhoods: List[str], topic: str) -> List[str]:
        """Find cross-promotion opportunities"""
        opportunities = []

        if neighborhoods:
            opportunities.append(f"Partner with {neighborhoods[0]} community organizations")

        if any(keyword in topic.lower() for keyword in ['school', 'education']):
            opportunities.append("Coordinate with school district communications")

        if any(keyword in topic.lower() for keyword in ['development', 'housing']):
            opportunities.append("Cross-promote with planning/zoning coverage")

        return opportunities

class CommunityNeedDetector:
    """Detects emerging community needs and issues"""

    def __init__(self, stories_data: List[Dict]):
        self.stories = stories_data
        self.topic_trends = []

    def detect_emerging_issues(self) -> List[CoverageInsight]:
        """Detect emerging community issues across neighborhoods"""
        insights = []

        if not ML_AVAILABLE:
            return self._basic_trend_detection()

        # Use topic modeling to identify emerging themes
        try:
            # Prepare text data
            documents = []
            story_metadata = []

            for story in self.stories[-100:]:  # Focus on recent stories
                text = f"{story.get('title', '')} {story.get('social_abstract', '')}"
                if text.strip():
                    documents.append(text)
                    story_metadata.append(story)

            if len(documents) < 10:
                return insights

            # Vectorize documents
            vectorizer = TfidfVectorizer(max_features=100, stop_words='english', max_df=0.8, min_df=2)
            doc_vectors = vectorizer.fit_transform(documents)

            # Topic modeling
            n_topics = min(8, len(documents) // 3)
            lda = LatentDirichletAllocation(n_components=n_topics, random_state=42)
            topic_distributions = lda.fit_transform(doc_vectors)

            # Analyze topics
            feature_names = vectorizer.get_feature_names_out()
            topics = []

            for topic_idx, topic in enumerate(lda.components_):
                top_words_idx = topic.argsort()[-10:][::-1]
                top_words = [feature_names[i] for i in top_words_idx]
                topics.append(top_words)

            # Find cross-neighborhood trends
            for topic_idx, topic_words in enumerate(topics):
                # Find stories most related to this topic
                topic_stories = []
                for i, story in enumerate(story_metadata):
                    if topic_distributions[i][topic_idx] > 0.3:  # High relevance threshold
                        topic_stories.append(story)

                if len(topic_stories) >= 3:  # Significant trend
                    # Analyze geographic spread
                    affected_neighborhoods = set()
                    for story in topic_stories:
                        neighborhoods = story.get('neighborhoods', '')
                        if neighborhoods:
                            for neighborhood in neighborhoods.split(','):
                                neighborhood = neighborhood.strip()
                                if neighborhood:
                                    affected_neighborhoods.add(neighborhood)

                    if len(affected_neighborhoods) >= 2:  # Multi-neighborhood issue
                        insights.append(CoverageInsight(
                            insight_type='trend',
                            priority='high' if len(affected_neighborhoods) >= 4 else 'medium',
                            title=f'Emerging Issue: {", ".join(topic_words[:3])}',
                            description=f'Topic trending across {len(affected_neighborhoods)} neighborhoods',
                            affected_areas=list(affected_neighborhoods),
                            metrics={
                                'topic_keywords': topic_words[:5],
                                'affected_neighborhoods': list(affected_neighborhoods),
                                'related_stories': len(topic_stories),
                                'trend_strength': float(np.mean([topic_distributions[i][topic_idx]
                                                               for i in range(len(story_metadata))
                                                               if topic_distributions[i][topic_idx] > 0.1]))
                            },
                            recommendation=f'Consider comprehensive coverage of {topic_words[0]} issues across affected areas',
                            confidence=0.8
                        ))

        except Exception as e:
            print(f"Topic modeling error: {e}")
            return self._basic_trend_detection()

        return insights

    def _basic_trend_detection(self) -> List[CoverageInsight]:
        """Basic trend detection without ML"""
        insights = []

        # Simple keyword frequency analysis across neighborhoods
        keyword_by_neighborhood = defaultdict(lambda: defaultdict(int))

        for story in self.stories[-50:]:  # Recent stories
            title = story.get('title', '').lower()
            neighborhoods = story.get('neighborhoods', '')

            if neighborhoods:
                # Extract potential issue keywords
                issue_keywords = ['housing', 'development', 'traffic', 'school', 'safety', 'council', 'budget']

                for keyword in issue_keywords:
                    if keyword in title:
                        for neighborhood in neighborhoods.split(','):
                            neighborhood = neighborhood.strip()
                            if neighborhood:
                                keyword_by_neighborhood[keyword][neighborhood] += 1

        # Find keywords affecting multiple neighborhoods
        for keyword, neighborhoods in keyword_by_neighborhood.items():
            if len(neighborhoods) >= 3 and sum(neighborhoods.values()) >= 5:
                insights.append(CoverageInsight(
                    insight_type='trend',
                    priority='medium',
                    title=f'Multi-Area Trend: {keyword.title()}',
                    description=f'{keyword.title()} issues identified across {len(neighborhoods)} areas',
                    affected_areas=list(neighborhoods.keys()),
                    metrics={
                        'keyword': keyword,
                        'total_mentions': sum(neighborhoods.values()),
                        'area_distribution': dict(neighborhoods)
                    },
                    recommendation=f'Consider coordinated coverage of {keyword} issues',
                    confidence=0.7
                ))

        return insights

class StrategicAnalyticsDashboard:
    """Main dashboard orchestrating all analytics components"""

    def __init__(self, stories_file: str = "frontend/src/data/stories.json"):
        self.stories_data = self._load_stories_data(stories_file)
        self.coverage_analyzer = CoverageGapAnalyzer(self.stories_data)
        self.impact_predictor = StoryImpactPredictor(self.stories_data)
        self.need_detector = CommunityNeedDetector(self.stories_data)

    def _load_stories_data(self, stories_file: str) -> List[Dict]:
        """Load stories data from JSON file"""
        try:
            with open(stories_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('stories', [])
        except FileNotFoundError:
            print(f"Warning: {stories_file} not found")
            return []

    def generate_strategic_insights(self) -> Dict:
        """Generate comprehensive strategic insights"""
        insights = {
            'coverage_gaps': [],
            'emerging_trends': [],
            'story_opportunities': [],
            'performance_predictions': [],
            'recommendations': []
        }

        # Coverage gap analysis
        coverage_insights = self.coverage_analyzer.analyze_demographic_coverage_gaps()
        coverage_insights.extend(self.coverage_analyzer.analyze_temporal_coverage_patterns())
        coverage_insights.extend(self.coverage_analyzer.analyze_topic_coverage_balance())
        insights['coverage_gaps'] = [self._insight_to_dict(insight) for insight in coverage_insights]

        # Emerging trends
        trend_insights = self.need_detector.detect_emerging_issues()
        insights['emerging_trends'] = [self._insight_to_dict(insight) for insight in trend_insights]

        # Strategic recommendations
        recommendations = self._generate_strategic_recommendations(coverage_insights + trend_insights)
        insights['recommendations'] = recommendations

        return insights

    def _insight_to_dict(self, insight: CoverageInsight) -> Dict:
        """Convert insight to dictionary for JSON serialization"""
        return {
            'type': insight.insight_type,
            'priority': insight.priority,
            'title': insight.title,
            'description': insight.description,
            'affected_areas': insight.affected_areas,
            'metrics': insight.metrics,
            'recommendation': insight.recommendation,
            'confidence': insight.confidence
        }

    def _generate_strategic_recommendations(self, all_insights: List[CoverageInsight]) -> List[Dict]:
        """Generate high-level strategic recommendations"""
        recommendations = []

        # High-priority gaps
        high_priority_gaps = [i for i in all_insights if i.priority == 'high']
        if high_priority_gaps:
            recommendations.append({
                'type': 'immediate_action',
                'title': 'Address High-Priority Coverage Gaps',
                'description': f'Focus resources on {len(high_priority_gaps)} critical coverage areas',
                'actions': [gap.recommendation for gap in high_priority_gaps[:3]],
                'expected_impact': 'Improved community engagement and coverage equity'
            })

        # Resource allocation
        all_affected_areas = []
        for insight in all_insights:
            all_affected_areas.extend(insight.affected_areas)

        from collections import Counter
        area_frequency = Counter(all_affected_areas)
        top_focus_areas = area_frequency.most_common(5)

        if top_focus_areas:
            recommendations.append({
                'type': 'resource_allocation',
                'title': 'Optimize Reporter Assignments',
                'description': 'Strategic reallocation based on coverage analysis',
                'actions': [f'Increase focus on {area} ({count} issues identified)'
                          for area, count in top_focus_areas[:3]],
                'expected_impact': 'Better coverage efficiency and community relevance'
            })

        return recommendations

def main():
    """Generate strategic analytics report"""
    print("=== AI-POWERED STRATEGIC ANALYTICS FOR PUBLICSOURCE ===")

    dashboard = StrategicAnalyticsDashboard()
    insights = dashboard.generate_strategic_insights()

    print(f"\nCoverage Gaps Identified: {len(insights['coverage_gaps'])}")
    for gap in insights['coverage_gaps']:
        print(f"  - {gap['title']} (Priority: {gap['priority']})")

    print(f"\nEmerging Trends: {len(insights['emerging_trends'])}")
    for trend in insights['emerging_trends']:
        print(f"  - {trend['title']} (Confidence: {trend['confidence']:.2f})")

    print(f"\nStrategic Recommendations: {len(insights['recommendations'])}")
    for rec in insights['recommendations']:
        print(f"  - {rec['title']}: {rec['description']}")

if __name__ == "__main__":
    main()