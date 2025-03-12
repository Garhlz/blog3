import re

def extract_problems_from_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 找到所有二级标题及其后的标签行
    pattern = r'##\s+([^\n]+)\n\n([^\n]+)'
    matches = re.findall(pattern, content)
    
    problems = []
    problem_id = 43  # 从12开始，根据示例
    
    for title, tags_line in matches:
        # 提取标题中的问题名称（去除可能的标签部分）
        problem_name = title.strip()
        
        # 处理标签行
        # 匹配中文逗号分隔的标签和可能的括号内容
        tags = []
        # 分割标签行并处理括号
        parts = tags_line.split('，')
        for part in parts:
            part = part.strip()
            # 如果有括号，去掉括号保留内容
            if '（' in part and '）' in part:
                content = part[part.find('（')+1:part.find('）')]
                tags.append(content)
            else:
                tags.append(part)
        
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

def process_markdown_file(input_file, output_file):
    # 提取问题信息
    problems = extract_problems_from_markdown(input_file)
    
    # 生成元数据
    metadata = generate_metadata(problems)
    
    # 读取原文件内容
    with open(input_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    # 将元数据添加到文件开头
    output_content = metadata + '\n' + original_content
    
    # 写入新文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_content)

# 使用示例
input_file = '刷题日记25-03-12.md'  # 输入的Markdown文件
output_file = 'output.md' # 输出的结果文件
process_markdown_file(input_file, output_file)