# usage-meter

Claude Code の入力欄の上に、使用量を常に表示する mod です。

`使用量: コンテキスト 25% (50k/200k) ｜ 5時間 42% (10/13 18:00リセット) ｜ 週間 85%`

- 応答のたびに自動更新、80%を超えると黄色表示
- 計測前は「使用量: 計測待ち」と表示
- 料金（$）は、利用上限のない API 利用時のみ表示

## インストール

ターミナルの Claude Code で次を入力:

```
/plugin install usage-meter --marketplace 08hida28-bot/usage-meter
```

「Add marketplace?」に `y`、スコープは一番上の user を Enter で選択。以降のすべてのセッションで有効になります。

## 更新

```
claude plugin update usage-meter@usage-meter
```
