#!/usr/bin/env python3
import json
import csv
import argparse

def main():
    parser = argparse.ArgumentParser(
        description="Convert JSON quiz file to Anki TSV format for easy import."
    )
    parser.add_argument(
        "input_file", help="Path to the input JSON file (e.g., questions.json)"
    )
    parser.add_argument(
        "output_file", help="Path to the output TSV file (e.g., anki_import.tsv)"
    )
    args = parser.parse_args()

    # Load JSON data
    with open(args.input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    questions = data.get("questions", [])
    
    # Open the TSV file for writing (Anki can import tab-separated fields)
    with open(args.output_file, "w", encoding="utf-8", newline="") as tsvfile:
        writer = csv.writer(tsvfile, delimiter="\t")
        
        for q in questions:
            question_text = q.get("question", "")
            module = q.get("module", "")
            section = q.get("section", "")
            choices = q.get("choices", {})
            correct = q.get("correctAnswer", "")
            explanation = q.get("explanation", "")
            
            # Format choices as HTML for better formatting in Anki
            choices_lines = []
            # Ensure the keys appear in a standard order (A, B, C, D, etc.)
            for key in sorted(choices.keys()):
                choices_lines.append(f"{key}: {choices[key]}")
            choices_html = "<br>".join(choices_lines)
            
            # Front: module, section, question text, and choices
            front = (
                f"<b>Module:</b> {module}<br>"
                f"<b>Section:</b> {section}<br><br>"
                f"{question_text}<br><br>"
                f"<b>Choices:</b><br>{choices_html}"
            )

            # Back: correct answer and explanation
            back = (
                f"<b>Correct Answer:</b> {correct}<br><br>"
                f"<b>Explanation:</b> {explanation}"
            )
            
            writer.writerow([front, back])
    
    print(f"Conversion complete. Anki import file saved to '{args.output_file}'.")

if __name__ == "__main__":
    main()
