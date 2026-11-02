
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";



/* =========================================================
   CHECK SERVER
========================================================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Nabeng SBA AI server is running."
    });
});


/* =========================================================
   GENERATE LESSON PLAN
========================================================= */

app.post("/generate-plan", async (req, res) => {

    try {

        const {
            type,
            subject,
            term,
            week,
            className,
            topic,
            subtopic,
            duration
        } = req.body;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!subject) {
            return res.status(400).json({
                error: "Subject is required."
            });
        }

        if (!className) {
            return res.status(400).json({
                error: "Class is required."
            });
        }

        if (!topic) {
            return res.status(400).json({
                error: "Lesson topic is required."
            });
        }


        /* ---------------------------------------------
           CHECK API KEY
        --------------------------------------------- */

        if (!OPENAI_KEY) {

            console.error(
                "OPENAI_API_KEY is not configured."
            );

            return res.status(500).json({
                error:
                    "AI service is not configured on the server."
            });
        }


        /* ---------------------------------------------
           CREATE PROMPT
        --------------------------------------------- */

        const prompt = `
You are an expert Ghana Education Service (GES)
basic school teacher and professional lesson-plan writer.

Create a detailed, well-structured lesson plan for a
Ghanaian basic school teacher.

LESSON INFORMATION

Subject: ${subject}
Class: ${className}
Term: ${term || "Not specified"}
Week: ${week || "Not specified"}
Topic: ${topic}
Subtopic: ${subtopic || "Not specified"}
Duration: ${duration || "Not specified"}

Prepare the lesson plan using the following structure:

1. Lesson Title
2. Subject
3. Class
4. Term
5. Week
6. Date
7. Duration
8. Topic
9. Subtopic
10. Strand
11. Sub-strand
12. Learning Objectives
13. Key Vocabulary
14. Teaching and Learning Resources
15. Previous Knowledge
16. Introduction
17. Lesson Development
18. Teacher Activities
19. Learner Activities
20. Assessment
21. Differentiation / Support for Learners
22. Conclusion
23. Homework / Assignment

Make the lesson appropriate for the specified class.

Use clear professional language.

The learning objectives should be measurable.

The activities should be practical and suitable for
a Ghanaian classroom.

Do not invent unnecessary information.

Where curriculum-specific information is uncertain,
use a sensible educational formulation rather than
claiming an exact official GES code.

Format the final lesson plan clearly with headings
and bullet points.
`;


        /* ---------------------------------------------
           CALL OPENAI
        --------------------------------------------- */

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${OPENAI_KEY}`
                },

                body: JSON.stringify({

                    model: "gpt-4o-mini",

                    messages: [

                        {
                            role: "system",
                            content:
                                "You are an expert Ghanaian basic school teacher and professional lesson-plan writer."
                        },

                        {
                            role: "user",
                            content: prompt
                        }

                    ],

                    temperature: 0.7,

                    max_tokens: 4000
                })
            }
        );


        /* ---------------------------------------------
           READ OPENAI RESPONSE
        --------------------------------------------- */

        const data = await response.json();


        console.log(
            "OpenAI status:",
            response.status
        );


        if (!response.ok) {

            console.error(
                "OpenAI error:",
                data
            );

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "OpenAI request failed."
            });
        }


        const result =
            data?.choices?.[0]?.message?.content;


        if (!result) {

            console.error(
                "No lesson plan returned:",
                data
            );

            return res.status(500).json({
                error:
                    "The AI did not return a lesson plan."
            });
        }


        /* ---------------------------------------------
           SEND RESULT TO FRONTEND
        --------------------------------------------- */

        return res.json({

            success: true,

            result: result

        });


    } catch (error) {

        console.error(
            "GENERATE PLAN ERROR:",
            error
        );

        return res.status(500).json({

            error:
                "Unable to generate the lesson plan."

        });

    }

});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

    console.log(
        `Nabeng SBA AI Server running on port ${PORT}`
    );

});
