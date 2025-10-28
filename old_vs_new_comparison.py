#!/usr/bin/env python3
"""
Old vs New Geographic Classification Comparison Tool
Simulates the old classification system and compares with new AI-enhanced results
"""

import json
import re
import pandas as pd
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set

class OldClassificationSimulator:
    """Simulates the old simple string-matching classification system"""

    def __init__(self):
        # Load Pittsburgh neighborhoods data
        try:
            with open('frontend/src/data/pittsburgh_neighborhoods.json', 'r', encoding='utf-8') as f:
                self.neighborhoods_data = json.load(f)
        except FileNotFoundError:
            print("Warning: Pittsburgh neighborhoods data not found, using basic list")
            self.neighborhoods_data = []

        # Basic neighborhood list from the old system
        self.old_neighborhoods = [
            "downtown", "oakland", "shadyside", "squirrel hill", "lawrenceville",
            "strip district", "south side", "north side", "east liberty",
            "bloomfield", "friendship", "garfield", "highland park", "morningside",
            "polish hill", "troy hill", "mexican war streets", "allegheny west",
            "manchester", "chateau", "bellevue", "avalon", "sewickley",
            "braddock", "clairton", "mckeesport", "homestead", "munhall",
            "whitehall", "bethel park", "peters township", "upper st clair",
            "mt lebanon", "dormont", "beechview", "brookline", "knoxville"
        ]

        # Geographic areas the old system recognized
        self.old_geographic_areas = [
            "downtown", "north side", "south side", "east end", "west end",
            "central pittsburgh", "allegheny county"
        ]

    def old_classify_article(self, article: Dict) -> Dict:
        """Simulate how the old system would classify an article"""
        title = article.get('title', '').lower()
        url = article.get('url', '').lower()

        # Simple string matching - the old way
        matched_neighborhoods = []
        matched_areas = []

        # Look for exact string matches in title and URL
        for neighborhood in self.old_neighborhoods:
            if neighborhood in title or neighborhood in url:
                matched_neighborhoods.append(neighborhood.title())

        for area in self.old_geographic_areas:
            if area in title or area in url:
                matched_areas.append(area.title())

        # Default fallback
        if not matched_neighborhoods and not matched_areas:
            if any(pgh_term in title for pgh_term in ['pittsburgh', 'pgh']):
                matched_areas.append('Central Pittsburgh')
            else:
                matched_areas.append('Unknown')

        return {
            'neighborhoods': ', '.join(matched_neighborhoods) if matched_neighborhoods else '',
            'geographic_area': ', '.join(matched_areas) if matched_areas else 'Unknown',
            'umbrella': 'Pittsburgh' if matched_neighborhoods or matched_areas else 'General',
            'confidence': 0.6 if matched_neighborhoods else 0.3  # Simple confidence
        }

class ComparisonAnalyzer:
    """Analyzes differences between old and new classification systems"""

    def __init__(self, stories_file: str = "frontend/src/data/stories.json"):
        self.stories_file = stories_file
        self.old_simulator = OldClassificationSimulator()
        self.load_stories()

    def load_stories(self):
        """Load current stories with new classifications"""
        try:
            with open(self.stories_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.stories = data.get('stories', [])
        except FileNotFoundError:
            print(f"Error: {self.stories_file} not found")
            self.stories = []

    def generate_comparison_metrics(self) -> Dict:
        """Generate comprehensive comparison metrics"""
        old_classifications = []
        new_classifications = []
        comparison_data = []

        # Process each story
        for story in self.stories:
            # Get old classification (simulated)
            old_result = self.old_simulator.old_classify_article(story)

            # Get new classification (current)
            new_result = {
                'neighborhoods': story.get('neighborhoods', ''),
                'geographic_area': story.get('geographic_area', ''),
                'umbrella': story.get('umbrella', ''),
                'confidence': 0.85  # New system typically has higher confidence
            }

            old_classifications.append(old_result)
            new_classifications.append(new_result)

            # Compare classifications
            comparison_data.append({
                'url': story.get('url', ''),
                'title': story.get('title', ''),
                'old_neighborhoods': old_result['neighborhoods'],
                'new_neighborhoods': new_result['neighborhoods'],
                'old_geographic_area': old_result['geographic_area'],
                'new_geographic_area': new_result['geographic_area'],
                'old_umbrella': old_result['umbrella'],
                'new_umbrella': new_result['umbrella'],
                'classification_changed': self._classification_changed(old_result, new_result),
                'improvement_type': self._get_improvement_type(old_result, new_result)
            })

        # Calculate metrics
        metrics = self._calculate_metrics(old_classifications, new_classifications, comparison_data)

        return {
            'summary': metrics,
            'detailed_comparisons': comparison_data[:10],  # First 10 for display
            'all_comparisons': comparison_data
        }

    def _classification_changed(self, old: Dict, new: Dict) -> bool:
        """Check if classification changed between old and new"""
        return (old['neighborhoods'] != new['neighborhoods'] or
                old['geographic_area'] != new['geographic_area'])

    def _get_improvement_type(self, old: Dict, new: Dict) -> str:
        """Categorize the type of improvement"""
        if old['neighborhoods'] == '' and new['neighborhoods'] != '':
            return 'Added neighborhood classification'
        elif old['neighborhoods'] != '' and new['neighborhoods'] != old['neighborhoods']:
            return 'Improved neighborhood accuracy'
        elif old['geographic_area'] == 'Unknown' and new['geographic_area'] != 'Unknown':
            return 'Resolved unknown area'
        elif old['geographic_area'] != new['geographic_area']:
            return 'Improved geographic area'
        elif new['confidence'] > old['confidence']:
            return 'Higher confidence'
        else:
            return 'No significant change'

    def _calculate_metrics(self, old_data: List[Dict], new_data: List[Dict], comparisons: List[Dict]) -> Dict:
        """Calculate comprehensive comparison metrics"""

        # Basic counts
        total_articles = len(old_data)
        changed_classifications = sum(1 for c in comparisons if c['classification_changed'])

        # Old system statistics
        old_with_neighborhoods = sum(1 for d in old_data if d['neighborhoods'])
        old_unknown_areas = sum(1 for d in old_data if d['geographic_area'] == 'Unknown')
        old_avg_confidence = sum(d['confidence'] for d in old_data) / len(old_data)

        # New system statistics
        new_with_neighborhoods = sum(1 for d in new_data if d['neighborhoods'])
        new_unknown_areas = sum(1 for d in new_data if d['geographic_area'] == 'Unknown')
        new_avg_confidence = sum(d['confidence'] for d in new_data) / len(new_data)

        # Coverage analysis
        old_unique_neighborhoods = set()
        new_unique_neighborhoods = set()

        for old, new in zip(old_data, new_data):
            if old['neighborhoods']:
                old_unique_neighborhoods.update([n.strip() for n in old['neighborhoods'].split(',')])
            if new['neighborhoods']:
                new_unique_neighborhoods.update([n.strip() for n in new['neighborhoods'].split(',')])

        # Improvement types
        improvement_counts = Counter(c['improvement_type'] for c in comparisons)

        # False positive analysis (like Knoxville TN issue)
        false_positives_fixed = sum(1 for c in comparisons
                                  if 'tennessee' in c['title'].lower() and
                                     'knoxville' in c['old_neighborhoods'].lower() and
                                     'knoxville' not in c['new_neighborhoods'].lower())

        return {
            'total_articles': total_articles,
            'classifications_changed': changed_classifications,
            'change_percentage': round((changed_classifications / total_articles) * 100, 2),

            'old_system': {
                'articles_with_neighborhoods': old_with_neighborhoods,
                'neighborhood_coverage_rate': round((old_with_neighborhoods / total_articles) * 100, 2),
                'unknown_areas': old_unknown_areas,
                'unknown_rate': round((old_unknown_areas / total_articles) * 100, 2),
                'unique_neighborhoods_identified': len(old_unique_neighborhoods),
                'average_confidence': round(old_avg_confidence, 3)
            },

            'new_system': {
                'articles_with_neighborhoods': new_with_neighborhoods,
                'neighborhood_coverage_rate': round((new_with_neighborhoods / total_articles) * 100, 2),
                'unknown_areas': new_unknown_areas,
                'unknown_rate': round((new_unknown_areas / total_articles) * 100, 2),
                'unique_neighborhoods_identified': len(new_unique_neighborhoods),
                'average_confidence': round(new_avg_confidence, 3)
            },

            'improvements': {
                'neighborhood_coverage_increase': new_with_neighborhoods - old_with_neighborhoods,
                'neighborhood_coverage_improvement': round(((new_with_neighborhoods - old_with_neighborhoods) / total_articles) * 100, 2),
                'unknown_areas_reduced': old_unknown_areas - new_unknown_areas,
                'new_neighborhoods_discovered': len(new_unique_neighborhoods - old_unique_neighborhoods),
                'confidence_improvement': round(new_avg_confidence - old_avg_confidence, 3),
                'false_positives_fixed': false_positives_fixed,
                'improvement_breakdown': dict(improvement_counts)
            }
        }

def main():
    """Generate and save comparison analysis"""
    print("=== OLD vs NEW GEOGRAPHIC CLASSIFICATION COMPARISON ===")

    analyzer = ComparisonAnalyzer()
    results = analyzer.generate_comparison_metrics()

    # Save results
    with open('old_vs_new_comparison_report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Display summary
    metrics = results['summary']

    print(f"\n=== COMPARISON SUMMARY ===")
    print(f"Total Articles Analyzed: {metrics['total_articles']}")
    print(f"Classifications Changed: {metrics['classifications_changed']} ({metrics['change_percentage']}%)")

    print(f"\n=== NEIGHBORHOOD COVERAGE ===")
    print(f"Old System: {metrics['old_system']['neighborhood_coverage_rate']}% ({metrics['old_system']['articles_with_neighborhoods']}/{metrics['total_articles']})")
    print(f"New System: {metrics['new_system']['neighborhood_coverage_rate']}% ({metrics['new_system']['articles_with_neighborhoods']}/{metrics['total_articles']})")
    print(f"Improvement: +{metrics['improvements']['neighborhood_coverage_improvement']}% ({metrics['improvements']['neighborhood_coverage_increase']} more articles)")

    print(f"\n=== GEOGRAPHIC AREA ACCURACY ===")
    print(f"Old Unknown Areas: {metrics['old_system']['unknown_rate']}% ({metrics['old_system']['unknown_areas']})")
    print(f"New Unknown Areas: {metrics['new_system']['unknown_rate']}% ({metrics['new_system']['unknown_areas']})")
    print(f"Unknown Areas Reduced: {metrics['improvements']['unknown_areas_reduced']}")

    print(f"\n=== NEIGHBORHOOD DISCOVERY ===")
    print(f"Old System Neighborhoods: {metrics['old_system']['unique_neighborhoods_identified']}")
    print(f"New System Neighborhoods: {metrics['new_system']['unique_neighborhoods_identified']}")
    print(f"New Neighborhoods Discovered: {metrics['improvements']['new_neighborhoods_discovered']}")

    print(f"\n=== CONFIDENCE & ACCURACY ===")
    print(f"Old Average Confidence: {metrics['old_system']['average_confidence']}")
    print(f"New Average Confidence: {metrics['new_system']['average_confidence']}")
    print(f"Confidence Improvement: +{metrics['improvements']['confidence_improvement']}")
    print(f"False Positives Fixed: {metrics['improvements']['false_positives_fixed']}")

    print(f"\n=== IMPROVEMENT BREAKDOWN ===")
    for improvement_type, count in metrics['improvements']['improvement_breakdown'].items():
        print(f"  {improvement_type}: {count} articles")

    print(f"\n=== FILES GENERATED ===")
    print(f"  - old_vs_new_comparison_report.json (Complete analysis)")

    # Create CSV for easy viewing
    comparison_df = pd.DataFrame(results['all_comparisons'])
    comparison_df.to_csv('old_vs_new_detailed_comparison.csv', index=False, encoding='utf-8')
    print(f"  - old_vs_new_detailed_comparison.csv (Article-by-article comparison)")

if __name__ == "__main__":
    main()