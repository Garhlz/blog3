import re

def extract_problems_from_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配二级标题及其后的标签行
    pattern = r'##\s+([^\n]+)\n\n([^\n]+)'
    matches = re.findall(pattern, content)
    
    problems = []
    problem_id = 50  # 从12开始，根据示例
    
    for title, tags_line in matches:
        # 提取标题作为问题名称
        problem_name = title.strip()
        
        # 处理标签行
        tags = []
        # 先提取括号内的内容（如果有）
        bracket_content = []
        if '（' in tags_line and '）' in tags_line:
            bracket_part = tags_line[tags_line.find('（')+1:tags_line.find('）')]
            bracket_content = [tag.strip() for tag in bracket_part.split('，')]
            # 移除括号及其内容，保留前面的部分
            tags_line = tags_line[:tags_line.find('（')].strip()
        
        # 处理括号前的标签（如果有）
        if tags_line:
            tags.extend([tag.strip() for tag in tags_line.split('，')])
        
        # 添加括号内的标签
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
        metadata += f'  - id: "{problem["id"]}"\n'
        metadata += f'    name: "{problem["name"]}"\n'
        tags_str = ', '.join(f'"{tag}"' for tag in problem['tags'])
        metadata += f'    tags: [{tags_str}]\n'
    metadata += '---\n'
    return metadata

def process_markdown_file(input_file, output_file ):
    problems = extract_problems_from_markdown(input_file)
    metadata = generate_metadata(problems)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    output_content = metadata + '\n' + original_content
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_content)

# 使用示例
input_file = '刷题日记25-03-13.md'
output_file = 'output.md'
process_markdown_file(input_file, output_file)