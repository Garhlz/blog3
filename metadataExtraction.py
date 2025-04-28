import re

def extract_problems_from_markdown(file_path, start_id):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配：## 二级标题 后若干空行 后标签行
    pattern = r'##\s+([^\n]+)\n+([^\n]+)'
    matches = re.findall(pattern, content)
    
    problems = []
    problem_id = start_id  
    
    for title, tags_line in matches:
        # 提取标题作为问题名称
        problem_name = title.strip()
        
        # 处理标签行
        tags = []

        # 提取所有括号内容（中文括号、英文括号）
        bracket_parts = re.findall(r'[\(（](.*?)[\)）]', tags_line)
        bracket_content = []
        for part in bracket_parts:
            bracket_content.extend(tag.strip() for tag in re.split('[，,]', part))

        # 移除所有括号及其中内容
        tags_line = re.sub(r'[\(（].*?[\)）]', '', tags_line).strip()

        # 处理括号外的标签，按中文逗号或英文逗号分隔
        if tags_line:
            tags.extend(tag.strip() for tag in re.split('[，,]', tags_line))
        
        # 添加括号里的标签
        tags.extend(bracket_content)
        
        # 创建问题字典
        problem = {
            'id': str(problem_id),
            'name': problem_name,
            'tags': tags
        }
        problems.append(problem)
        problem_id += 1
    
    return problems

def generate_metadata(problems):
    metadata = '---\nproblems:\n'
    for problem in problems:
        safe_name = problem["name"].replace('"', '\\"')  # 转义双引号
        metadata += f'  - id: "{problem["id"]}"\n'
        metadata += f'    name: "{safe_name}"\n'
        tags_str = ', '.join('"' + tag.replace('"', '\\"') + '"' for tag in problem['tags'])
        metadata += f'    tags: [{tags_str}]\n'
    metadata += '---\n'
    return metadata

def process_markdown_file(input_file, output_file, start_id):
    problems = extract_problems_from_markdown(input_file, start_id)
    metadata = generate_metadata(problems)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    output_content = metadata + '\n' + original_content
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_content)

# 示例使用
if __name__ == "__main__":
    input_file = '刷题日记25-04-28.md'
    output_file = 'output.md'
    start_id = 72
    process_markdown_file(input_file, output_file, start_id)
