#!/usr/bin/env python3
"""
Advanced Geographic Classification System
Multi-layer NLP-based geographic entity detection and context validation
"""

import json
import re
import networkx as nx
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
from collections import defaultdict
import warnings
warnings.filterwarnings("ignore")

# Try to import advanced NLP libraries (graceful fallback if not installed)
try:
    import spacy
    from spacy.lang.en import English
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    import joblib
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

@dataclass
class GeographicEntity:
    """Represents a detected geographic entity with rich metadata"""
    text: str
    official_name: str
    entity_type: str  # 'neighborhood', 'municipality', 'city', 'county'
    confidence: float
    position: int  # Position in text
    context: str  # Surrounding context
    syntactic_role: str  # Subject, object, modifier, etc.
    semantic_context: str  # Geographic, organizational, sports, etc.
    parent_entities: List[str]  # Hierarchical parents
    coordinates: Optional[Tuple[float, float]] = None

class HierarchicalGeographicGraph:
    """Graph-based representation of geographic hierarchies"""

    def __init__(self):
        self.graph = nx.DiGraph()
        self.place_to_type = {}
        self.type_hierarchy = ['state', 'county', 'city', 'municipality', 'neighborhood']

    def add_place(self, place: str, place_type: str, parent: str = None,
                  aliases: List[str] = None, coordinates: Tuple[float, float] = None):
        """Add a place to the geographic hierarchy"""
        self.graph.add_node(place,
                           type=place_type,
                           aliases=aliases or [],
                           coordinates=coordinates)
        self.place_to_type[place] = place_type

        if parent:
            self.graph.add_edge(parent, place)

    def get_parents(self, place: str) -> List[str]:
        """Get all parent entities in the hierarchy"""
        return list(self.graph.predecessors(place))

    def get_children(self, place: str) -> List[str]:
        """Get all child entities in the hierarchy"""
        return list(self.graph.successors(place))

    def get_all_ancestors(self, place: str) -> List[str]:
        """Get all ancestors (recursive parents) of a place"""
        ancestors = []
        try:
            for ancestor in nx.ancestors(self.graph, place):
                ancestors.append(ancestor)
        except nx.NetworkXError:
            pass
        return ancestors

    def resolve_ambiguous_reference(self, place: str, context_places: List[str]) -> str:
        """Resolve ambiguous place references using context"""
        if place not in self.graph:
            return place

        # If we have context places, find the most likely interpretation
        for context_place in context_places:
            if context_place in self.graph:
                # Check if places are in same hierarchy
                if place in self.get_all_ancestors(context_place) or \
                   place in self.get_children(context_place):
                    return place

        return place

class AdvancedGeographicClassifier:
    """Sophisticated multi-layer geographic classification system"""

    def __init__(self, data_file: str = "enhanced_geographic_data.json"):
        self.geo_graph = HierarchicalGeographicGraph()
        self.load_geographic_data(data_file)

        # Initialize NLP components
        self.nlp = None
        self.semantic_model = None
        self.ml_classifier = None

        # Geographic context templates for semantic analysis
        self.geographic_templates = [
            "residents of {place} gathered",
            "officials in {place} announced",
            "neighborhood of {place} sees",
            "community in {place} organized",
            "{place} area development",
            "near {place} location",
            "from {place} community"
        ]

        self.non_geographic_templates = [
            "{place} team won championship",
            "University of {place} students",
            "{place} company announced",
            "{place} school district",
            "{place} organization meeting"
        ]

        self._initialize_components()

    def load_geographic_data(self, data_file: str):
        """Load and structure geographic data into hierarchical graph"""
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            print(f"Warning: {data_file} not found, using basic data")
            data = {'pittsburgh_neighborhoods': {}, 'allegheny_county_municipalities': {}}

        # Add Pennsylvania as root
        self.geo_graph.add_place("Pennsylvania", "state")

        # Add Allegheny County
        self.geo_graph.add_place("Allegheny County", "county", "Pennsylvania")

        # Add Pittsburgh as major city
        self.geo_graph.add_place("Pittsburgh", "city", "Allegheny County")

        # Add neighborhoods under Pittsburgh
        neighborhoods = data.get('pittsburgh_neighborhoods', {})
        for neighborhood, info in neighborhoods.items():
            aliases = [neighborhood]
            if isinstance(info, dict):
                aliases.extend(info.get('aliases', []))
                region = info.get('region', 'Pittsburgh')
            else:
                region = 'Pittsburgh'

            self.geo_graph.add_place(neighborhood, "neighborhood", "Pittsburgh", aliases)

        # Add municipalities under Allegheny County
        municipalities = data.get('allegheny_county_municipalities', {})
        for municipality, info in municipalities.items():
            aliases = [municipality]
            if isinstance(info, dict):
                aliases.extend(info.get('aliases', []))

            self.geo_graph.add_place(municipality, "municipality", "Allegheny County", aliases)

    def _initialize_components(self):
        """Initialize NLP and ML components with graceful fallbacks"""

        # Initialize spaCy for NER and dependency parsing
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")
                print("spaCy NER initialized")
            except OSError:
                print("Warning: spaCy model not found, using basic NLP")
                self.nlp = English()

        # Initialize sentence transformer for semantic analysis
        if EMBEDDINGS_AVAILABLE:
            try:
                self.semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
                print("Semantic embeddings initialized")
            except Exception as e:
                print(f"Warning: Could not load semantic model: {e}")

        # Initialize ML classifier
        if ML_AVAILABLE:
            self.ml_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
            print("ML classifier initialized")

    def extract_named_entities(self, text: str) -> List[GeographicEntity]:
        """Extract geographic named entities using spaCy NER"""
        entities = []

        if not self.nlp:
            # Fallback to basic regex-based extraction
            return self._basic_entity_extraction(text)

        doc = self.nlp(text)

        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC", "ORG"]:  # Geographic, Location, Organization
                # Analyze syntactic context
                syntactic_role = self._analyze_syntactic_role(ent)

                # Check if this is actually a geographic entity
                if self._is_geographic_entity(ent.text, syntactic_role, text):

                    # Find official name in our database
                    official_name = self._resolve_to_official_name(ent.text)

                    if official_name:
                        entity = GeographicEntity(
                            text=ent.text,
                            official_name=official_name,
                            entity_type=self.geo_graph.place_to_type.get(official_name, 'unknown'),
                            confidence=0.8,  # Will be refined by ML classifier
                            position=ent.start_char,
                            context=self._extract_context(text, ent.start_char, ent.end_char),
                            syntactic_role=syntactic_role,
                            semantic_context="geographic",  # Will be refined by semantic analysis
                            parent_entities=self.geo_graph.get_parents(official_name)
                        )
                        entities.append(entity)

        return entities

    def _basic_entity_extraction(self, text: str) -> List[GeographicEntity]:
        """Fallback basic entity extraction when spaCy is not available"""
        entities = []
        text_lower = text.lower()

        # Simple pattern matching for known places
        for place in self.geo_graph.graph.nodes():
            if place.lower() in text_lower:
                # Find position
                position = text_lower.find(place.lower())

                entity = GeographicEntity(
                    text=place,
                    official_name=place,
                    entity_type=self.geo_graph.place_to_type.get(place, 'unknown'),
                    confidence=0.6,  # Lower confidence for basic extraction
                    position=position,
                    context=self._extract_context(text, position, position + len(place)),
                    syntactic_role="unknown",
                    semantic_context="unknown",
                    parent_entities=self.geo_graph.get_parents(place)
                )
                entities.append(entity)

        return entities

    def _analyze_syntactic_role(self, entity) -> str:
        """Analyze the syntactic role of an entity in the sentence"""
        if not hasattr(entity, 'root'):
            return "unknown"

        root = entity.root
        if root.dep_ in ["nsubj", "nsubjpass"]:
            return "subject"
        elif root.dep_ in ["dobj", "pobj"]:
            return "object"
        elif root.dep_ in ["amod", "compound"]:
            return "modifier"
        else:
            return root.dep_

    def _is_geographic_entity(self, text: str, syntactic_role: str, full_text: str) -> bool:
        """Determine if an entity is actually geographic vs organizational/other"""

        # Rule-based checks for obvious non-geographic entities
        non_geographic_patterns = [
            r'\b' + re.escape(text) + r'\s+(team|steelers|pirates|penguins)\b',
            r'university\s+of\s+' + re.escape(text.lower()),
            r'\b' + re.escape(text) + r'\s+(company|corporation|inc|llc)\b',
            r'\b' + re.escape(text) + r'\s+(school|high school|elementary)\b'
        ]

        for pattern in non_geographic_patterns:
            if re.search(pattern, full_text.lower()):
                return False

        # Geographic indicators
        geographic_indicators = [
            r'\bin\s+' + re.escape(text.lower()),
            r'\bnear\s+' + re.escape(text.lower()),
            r'\bfrom\s+' + re.escape(text.lower()),
            r'\b' + re.escape(text.lower()) + r'\s+(neighborhood|community|area|residents)',
            r'\b' + re.escape(text.lower()) + r'\s+(officials|government|council)'
        ]

        for pattern in geographic_indicators:
            if re.search(pattern, full_text.lower()):
                return True

        # If syntactic role suggests geographic usage
        if syntactic_role in ["object"] and any(prep in full_text.lower()
                                              for prep in ["in", "at", "near", "from"]):
            return True

        return True  # Default to True, let other layers filter

    def _resolve_to_official_name(self, text: str) -> Optional[str]:
        """Resolve text to official geographic name"""
        text_lower = text.lower()

        # Direct match
        for place in self.geo_graph.graph.nodes():
            if place.lower() == text_lower:
                return place

        # Alias match
        for place in self.geo_graph.graph.nodes():
            place_data = self.geo_graph.graph.nodes[place]
            aliases = place_data.get('aliases', [])
            for alias in aliases:
                if alias.lower() == text_lower:
                    return place

        # Fuzzy match (basic)
        for place in self.geo_graph.graph.nodes():
            if self._fuzzy_match(text_lower, place.lower()):
                return place

        return None

    def _fuzzy_match(self, text1: str, text2: str, threshold: float = 0.9) -> bool:
        """Basic fuzzy string matching"""
        # Simple character overlap ratio
        if len(text1) == 0 or len(text2) == 0:
            return False

        # Exact substring match
        if text1 in text2 or text2 in text1:
            return True

        # Character set overlap
        set1, set2 = set(text1), set(text2)
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))

        return intersection / union >= threshold

    def _extract_context(self, text: str, start: int, end: int, window: int = 50) -> str:
        """Extract surrounding context for an entity"""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        return text[context_start:context_end]

    def semantic_context_analysis(self, entities: List[GeographicEntity], full_text: str) -> List[GeographicEntity]:
        """Analyze semantic context using embeddings"""
        if not self.semantic_model or not entities:
            return entities

        try:
            # Get embedding for the full text
            text_embedding = self.semantic_model.encode([full_text])

            for entity in entities:
                # Test against geographic vs non-geographic templates
                geo_scores = []
                non_geo_scores = []

                for template in self.geographic_templates:
                    context_text = template.format(place=entity.text)
                    context_embedding = self.semantic_model.encode([context_text])
                    similarity = cosine_similarity(text_embedding, context_embedding)[0][0]
                    geo_scores.append(similarity)

                for template in self.non_geographic_templates:
                    context_text = template.format(place=entity.text)
                    context_embedding = self.semantic_model.encode([context_text])
                    similarity = cosine_similarity(text_embedding, context_embedding)[0][0]
                    non_geo_scores.append(similarity)

                # Update semantic context and confidence
                max_geo_score = max(geo_scores) if geo_scores else 0
                max_non_geo_score = max(non_geo_scores) if non_geo_scores else 0

                if max_geo_score > max_non_geo_score:
                    entity.semantic_context = "geographic"
                    entity.confidence = min(1.0, entity.confidence + 0.2)
                else:
                    entity.semantic_context = "non_geographic"
                    entity.confidence = max(0.1, entity.confidence - 0.3)

        except Exception as e:
            print(f"Semantic analysis error: {e}")

        return entities

    def ml_confidence_scoring(self, entities: List[GeographicEntity], full_text: str) -> List[GeographicEntity]:
        """Use ML classifier to refine confidence scores"""
        if self.ml_classifier is None or not entities:
            return entities

        # For now, use rule-based features (can be trained with labeled data later)
        for entity in entities:
            features = self._extract_ml_features(entity, full_text)

            # Simple rule-based scoring (placeholder for trained model)
            score = 0.5

            # Position features
            if entity.position < len(full_text) * 0.3:  # Early in text
                score += 0.1

            # Syntactic role features
            if entity.syntactic_role in ["object"]:
                score += 0.15
            elif entity.syntactic_role in ["subject"]:
                score += 0.1

            # Context features
            if any(word in entity.context.lower() for word in
                   ["in", "at", "near", "from", "residents", "community", "neighborhood"]):
                score += 0.2

            # Hierarchy features
            if entity.parent_entities:
                score += 0.1

            # Semantic context
            if entity.semantic_context == "geographic":
                score += 0.2
            elif entity.semantic_context == "non_geographic":
                score -= 0.3

            entity.confidence = max(0.0, min(1.0, score))

        return entities

    def _extract_ml_features(self, entity: GeographicEntity, full_text: str) -> Dict:
        """Extract features for ML classification"""
        return {
            'position_ratio': entity.position / len(full_text),
            'text_length': len(entity.text),
            'context_length': len(entity.context),
            'has_geographic_prepositions': any(prep in entity.context.lower()
                                             for prep in ['in', 'at', 'near', 'from']),
            'has_administrative_words': any(word in entity.context.lower()
                                          for word in ['township', 'borough', 'county', 'neighborhood']),
            'is_capitalized': entity.text.istitle(),
            'has_parents': len(entity.parent_entities) > 0,
            'entity_type_score': {'neighborhood': 0.9, 'municipality': 0.8, 'city': 0.7, 'county': 0.6}.get(entity.entity_type, 0.5)
        }

    def hierarchical_resolution(self, entities: List[GeographicEntity]) -> List[GeographicEntity]:
        """Resolve ambiguities using hierarchical relationships"""

        # Group entities by their hierarchy level
        resolved_entities = []

        for entity in entities:
            # Check for parent-child relationships with other detected entities
            other_entities = [e.official_name for e in entities if e != entity]

            # If we found a parent entity, increase confidence
            for other_entity in other_entities:
                if other_entity in entity.parent_entities:
                    entity.confidence = min(1.0, entity.confidence + 0.15)
                    break

            # Resolve ambiguous references
            resolved_name = self.geo_graph.resolve_ambiguous_reference(
                entity.official_name, other_entities)
            entity.official_name = resolved_name

            resolved_entities.append(entity)

        return resolved_entities

    def classify_text(self, text: str, min_confidence: float = 0.4) -> Tuple[List[str], Dict[str, float]]:
        """Main classification method - returns places and confidence scores"""

        # Layer 1: Named Entity Recognition
        entities = self.extract_named_entities(text)

        if not entities:
            return [], {}

        # Layer 2: Semantic Context Analysis
        entities = self.semantic_context_analysis(entities, text)

        # Layer 3: ML Confidence Scoring
        entities = self.ml_confidence_scoring(entities, text)

        # Layer 4: Hierarchical Resolution
        entities = self.hierarchical_resolution(entities)

        # Filter by minimum confidence and remove duplicates
        high_confidence_entities = []
        seen_places = set()

        for entity in entities:
            if entity.confidence >= min_confidence and entity.official_name not in seen_places:
                high_confidence_entities.append(entity)
                seen_places.add(entity.official_name)

        # Sort by confidence
        high_confidence_entities.sort(key=lambda x: x.confidence, reverse=True)

        # Extract results
        places = [entity.official_name for entity in high_confidence_entities]
        confidence_scores = {entity.official_name: entity.confidence for entity in high_confidence_entities}

        return places, confidence_scores

# Convenience function to replace the old enhanced_geographic_scan
def advanced_geographic_scan(text: str, geo_db=None) -> Tuple[List[str], Dict[str, float]]:
    """Enhanced geographic scanning with multi-layer analysis"""
    classifier = AdvancedGeographicClassifier()
    return classifier.classify_text(text)

# Backward compatibility
class EnhancedGeographicDatabase:
    """Backward compatibility wrapper"""
    def __init__(self, data_file: str = "enhanced_geographic_data.json"):
        self.classifier = AdvancedGeographicClassifier(data_file)
        # Expose some attributes for backward compatibility
        self.pittsburgh_neighborhoods = list(self.classifier.geo_graph.graph.nodes())
        self.allegheny_municipalities = []
        for node in self.classifier.geo_graph.graph.nodes():
            if self.classifier.geo_graph.place_to_type.get(node) == 'municipality':
                self.allegheny_municipalities.append(node)
        self.alias_to_official = {}
        self.official_to_region = {}

def enhanced_geographic_scan(text: str, geo_db) -> Tuple[List[str], Dict[str, float]]:
    """Backward compatibility function"""
    if hasattr(geo_db, 'classifier'):
        return geo_db.classifier.classify_text(text)
    else:
        # Create new classifier
        classifier = AdvancedGeographicClassifier()
        return classifier.classify_text(text)

if __name__ == "__main__":
    # Test the advanced classifier
    classifier = AdvancedGeographicClassifier()

    test_cases = [
        "University of Pittsburgh students in Oakland neighborhood gathered for community meeting",
        "Manchester United fans from Manchester neighborhood watched the game",
        "Pittsburgh Steelers played against Oakland Raiders at Heinz Field",
        "Sewickley Heights residents met with Sewickley borough officials",
        "Near Pittsburgh, Moon Township officials announced new development plans"
    ]

    print("=== ADVANCED GEOGRAPHIC CLASSIFICATION TEST ===")
    for i, text in enumerate(test_cases, 1):
        print(f"\nTest {i}: {text}")
        places, scores = classifier.classify_text(text)
        print(f"  Detected places: {places}")
        print(f"  Confidence scores: {scores}")