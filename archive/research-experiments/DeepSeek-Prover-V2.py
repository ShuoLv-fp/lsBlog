from openai import OpenAI

client = OpenAI(
    api_key="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",
    base_url="https://openrouter.ai/api/v1"
    # base_url="https://api.deepseek.com/v1"
)

models = client.models.list()

# 打印所有 DeepSeek 模型
for m in models.data:
    if "deepseek" in m.id:
        print(m.id)

response = client.chat.completions.create(
    model="deepseek/deepseek-v3.2",
    messages=[
        {"role": "system", "content": "You are a professional Lean 4 formal proof assistant. Output only directly executable Lean 4 code—no explanations, no boilerplate. You must include the `theorem` declaration and complete proof steps. The proof must be rigorous, concise, and correct. "},
        {"role": "user", "content": "Generate Lean 4 formalized proof code for the Cauchy–Kovalevskaya theorem (reference: https://en.wikipedia.org/wiki/Cauchy%E2%80%93Kovalevskaya_theorem). "}
    ],
    temperature=0.1,
    max_tokens=4096
)

# print(response.choices[0].message.content)
# 直接保存到文件，避免编码错误
with open("lean_proof.txt", "w", encoding="utf-8") as f:
    f.write(response.choices[0].message.content)

print("✅ 证明代码已保存到 lean_proof.txt")