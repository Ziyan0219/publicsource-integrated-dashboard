#!/usr/bin/env python3
"""
improved_teaser_generator.py - Enhanced teaser generation following Social Media Voice Guidelines
"""
import openai
import re

def generate_improved_teaser(text: str) -> str:
    """
    Generate a social media teaser following Social Media Voice Guidelines:
    - Maintain consistent active voice
    - Promote facts first
    - Do not editorialize
    - Be cautious of creative juxtapositions that imply causation
    - Leverage quotes to help showcase personal perspectives
    - Do not duplicate headlines, SEO Titles or meta descriptions
    - Expand with supporting information from the story
    - Avoid redundancy
    - Identify 3-5 key topics from the story for varied content posts
    - Synthesize article subheadings
    - Leverage calls-to-action (explore, examine, investigate...)
    - Avoid clickbait phrasing
    - Ask questions when facts/perspectives in the story can answer them
    - Demonstrate story impacts to local communities/neighborhoods when included
    - Do not use the oxford comma
    - Follow Associated Press Style for copy
    - Avoid common AI invisible watermarks in diction, syntax, and punctuation
    - Keep under 30 words
    """
    
    # Extract first 1000 characters for context
    excerpt = text[:1000]
    
    # Enhanced prompt following the guidelines
    prompt = f"""You are a local news social media editor following strict voice guidelines. Create a compelling teaser (under 30 words) from this story excerpt.

VOICE GUIDELINES:
- Use active voice consistently
- Lead with facts, not opinions
- Include quotes when available to show personal perspectives
- Use calls-to-action: explore, examine, investigate, discover
- Ask questions that the story can answer
- Show local community impact when relevant
- No clickbait or sensationalism
- Follow AP Style
- No oxford comma
- Be curious, tenacious, constructive, empathetic, clear, concise, certain, informative and friendly

STORY EXCERPT:
{excerpt}

Create a factual, engaging teaser under 30 words that makes readers want to explore the full story:"""

    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.6,
        )
        
        teaser = response.choices[0].message.content.strip()
        
        # Clean up the teaser
        teaser = re.sub(r'^["\']*|["\']*$', '', teaser)  # Remove quotes at start/end
        teaser = re.sub(r'\s+', ' ', teaser)  # Normalize whitespace
        
        # Ensure it's under 30 words
        words = teaser.split()
        if len(words) > 30:
            teaser = ' '.join(words[:30])
            # Try to end at a natural break
            if not teaser.endswith(('.', '!', '?')):
                teaser += '...'
        
        return teaser
        
    except Exception as e:
        print(f"[ERROR] Teaser generation failed: {e}")
        # Fallback to simple summary
        words = excerpt.split()[:25]
        return ' '.join(words) + "..."

def test_teaser_generator():
    """Test the teaser generator with sample text"""
    sample_text = """
    Pittsburgh City Council voted Tuesday to approve a new affordable housing initiative 
    that will provide $50 million in funding over the next five years. The program aims 
    to create 1,000 new affordable housing units across the city's neighborhoods, with 
    priority given to areas experiencing gentrification pressure. Council member Sarah 
    Johnson said "This investment represents our commitment to ensuring all Pittsburgh 
    residents can afford to live in the communities they call home." The initiative will 
    be funded through a combination of federal grants, city bonds, and private partnerships.
    """
    
    # Set up OpenAI (you'll need to set your API key)
    # openai.api_key = "your-api-key-here"
    
    teaser = generate_improved_teaser(sample_text)
    print(f"Generated teaser: {teaser}")
    print(f"Word count: {len(teaser.split())}")

if __name__ == "__main__":
    test_teaser_generator()

