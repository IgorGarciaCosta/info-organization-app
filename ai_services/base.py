"""Pydantic models shared by the Gemini service and FastAPI response schema."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class Topic(BaseModel):
    """A relevant point extracted from the transcript."""

    title: str = Field(description="Short title for the topic.")
    content: str = Field(
        description="Objective explanation grounded in the transcript.")
    importance: Literal["high", "medium", "low"] = Field(
        description="Relative importance of this topic in the source content."
    )


class ContentAnalysis(BaseModel):
    """Structured analysis returned by an AI service for mobile rendering."""

    title: str = Field(description="Main title that represents the content.")
    subtitle: str = Field(description="One-sentence overview of the content.")
    theme: str = Field(
        description="Main subject, such as technology or education.")
    genre: Literal[
        "educational",
        "news",
        "opinion",
        "tutorial",
        "interview",
        "entertainment",
        "documentary",
        "other",
    ] = Field(description="Genre or communication style of the content.")
    topics: list[Topic] = Field(
        min_length=1,
        max_length=8,
        description="Key topics ordered from highest to lowest importance.",
    )
