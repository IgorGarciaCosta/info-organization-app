"""Focused checks for the structured AI response contract."""

import unittest

from ai_services import ContentAnalysis


class ContentAnalysisTest(unittest.TestCase):
    """Verifies that valid model JSON becomes a typed domain object."""

    def test_valid_structured_response(self) -> None:
        """Accept a complete structured response with a known importance level."""
        analysis = ContentAnalysis.model_validate_json(
            """{
                "title": "Como organizar informações",
                "subtitle": "Uma introdução prática.",
                "theme": "Produtividade",
                "genre": "educational",
                "topics": [{
                    "title": "Prioridades",
                    "content": "Organize primeiro o que traz maior impacto.",
                    "importance": "high"
                }]
            }"""
        )

        self.assertEqual(analysis.topics[0].importance, "high")


if __name__ == "__main__":
    unittest.main()