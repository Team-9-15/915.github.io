import os

def merge_files(directory_path, output_file):
    """
    Merges all HTML, JavaScript, and CSS files from the specified directory and its subdirectories
    into a single text file.

    Args:
        directory_path (str): Path to the root directory containing files.
        output_file (str): Name of the output file.
    """
    # List to store the content of all files
    all_content = []

    try:
        # Traverse the directory tree
        for root, _, files in os.walk(directory_path):
            for filename in files:
                # Check if the file has the desired extension
                if filename.endswith(('.html', '.js', '.css')):
                    file_path = os.path.join(root, filename)

                    # Add a header for each file
                    all_content.append(f"\n{'='*50}")
                    all_content.append(f"File: {os.path.relpath(file_path, directory_path)}")
                    all_content.append('='*50 + '\n')

                    # Read and append the content of each file
                    try:
                        with open(file_path, 'r', encoding='utf-8') as file:
                            content = file.read()
                            all_content.append(content)
                    except Exception as e:
                        print(f"Error reading {filename}: {str(e)}")

        # Write all content to the output file
        with open(output_file, 'w', encoding='utf-8') as outfile:
            outfile.write('\n'.join(all_content))

        print(f"Successfully merged all files into {output_file}")

    except Exception as e:
        print(f"An error occurred: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Replace with your directory path containing the project files
    directory_path = "."  # Current directory
    output_file = "merged_project_files.txt"

    merge_files(directory_path, output_file)

