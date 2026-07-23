"""Focused checks for the structured AI response contract."""

import unittest

from ai_services import ContentAnalysis


class ContentAnalysisTest(unittest.TestCase):
    """Verifies that valid model JSON becomes a typed domain object."""

    def test_valid_structured_response(self) -> None:
        """Accept a complete structured response with a known importance level."""
        analysis = ContentAnalysis.model_validate_json(
            """{
                "title": "How to organize information",
                "subtitle": "A practical introduction.",
                "theme": "Productivity",
                "genre": "educational",
                "topics": [{
                    "title": "Priorities",
                    "content": "Organize what has the greatest impact first.",
                    "importance": "high"
                }]
            }"""
        )

        self.assertEqual(analysis.topics[0].importance, "high")


if __name__ == "__main__":
    unittest.main()
