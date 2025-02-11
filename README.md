# Домашнее задание №1

Необходимо разработать CLI клиент для OpenLibrary.org, использую API по ссылке https://openlibrary.org/dev/docs/api/search

Вызов приложения должен иметь следующий вид:

```shell
openlibrary search [--json|csv] [--out=<file>] [--fields=<field,field,...>] [--sort=<field>] [--lang=<lang>] [--offset|page=<number>] [--limit=<number>] [--all] <query>
```

## Назначение опций

1. Формат вывода, взаимоисключающие опции:
   1. `--json` - вывод в формате JSON
   2. `--csv` - вывод в формате CSV
   3. При отсутствии опций вывод осуществляется в человекочитаемом виде
2. `--out` - имя выходного файла
3. `--fields` - список полей, которые необходимо вывести, разделены запятыми
4. `--lang` - двухбуквенный код языка, если не указан - используется системный
5. `--sort` - поле, по которому необходимо сортировать
6. Пагинация, параметры `--offset`, `--limit` и `-all` взаимоисключающие, одновременное использование должно вызывать ошибку:
   1. `--offset` + `--limit` - смещение и количество записей в выводе
   2. `--page` + `--limit` - номер страницы и количество записей на одной странице
   3. `--all` - вывод всех записей

Обязательные к реализации: форматы вывода, вывод в файл и пагинация. Остальные - в качестве бонусных задач.

## Что можно использовать

Рекомендуется использовать только инструменты и библиотеки из прослушанных лекций.

При желании можно выполнять задание на TypeScript.

## Дополнительные требования

* ошибки должны выводиться в стандартный поток ошибок (STDERR);
* при завершении с ошибкой должен использоваться код завершения, отличный от 0;
* по возможности корректность параметров должна проверяться локально.

## Порядок выполнения задания

1. Создать новый Git-репозиторий, добавить в него файл README.md с текстом задания и закоммитить в основную ветку.
2. Создать отдельную ветку для выполнения задания и всю работу выполнять в ней.
3. Опубликовать репозиторий с двумя ветками (основной с одним файлом README.md и рабочую с выполненным заданием) на GitHub или аналоге.
4. Создать PR из рабочей ветки в основную.
5. Ссылку на PR предоставить для ревью.