SELECT
    ID,
    MD5,
    Title,
    Author,
    Series,
    Edition,
    Language,
    Year,
    Publisher,
    Pages,
    Identifier,
    GooglebookID,
    ASIN,
    Coverurl,
    Extension,
    Filesize,
    Library,
    Issue,
    Locator,
    Commentary,
    Generic,
    Visible,
    TimeAdded,
    TimeLastModified,
    relevance
FROM
    (
        SELECT
            ID,
            MD5,
            Title,
            Author,
            Series,
            Edition,
            Language,
            Year,
            Publisher,
            Pages,
            Identifier,
            GooglebookID,
            ASIN,
            CONCAT('/fictioncovers/', Coverurl) AS Coverurl,
            Extension,
            Filesize,
            Library,
            Issue,
            Locator,
            Commentary,
            Generic,
            Visible,
            TimeAdded,
            TimeLastModified,
            (
                2.5 * (
                    MATCH(series) AGAINST (:ordered_search_term IN BOOLEAN MODE)
                ) + 1.3 * (
                    MATCH(series) AGAINST (:search_term IN BOOLEAN MODE)
                ) + (
                    2.2 * (
                        MATCH(title) AGAINST (:ordered_search_term IN BOOLEAN MODE)
                    )
                ) + (
                    1 * (
                        MATCH(title) AGAINST (:search_term IN BOOLEAN MODE)
                    )
                ) + (
                    1.8 * (
                        MATCH(author) AGAINST (:ordered_search_term IN BOOLEAN MODE)
                    )
                ) + (
                    0.6 * (
                        MATCH(author) AGAINST (:search_term IN BOOLEAN MODE)
                    )
                ) + (
                    4 * (
                        MATCH(language) AGAINST (:default_language IN BOOLEAN MODE)
                    )
                )
            ) AS relevance
        FROM
            fiction
        WHERE
            (
                MATCH(title, author, series) AGAINST (:search_term IN BOOLEAN MODE)
            )
        UNION
        ALL
        SELECT
            ID,
            MD5,
            Title,
            Author,
            Series,
            Edition,
            Language,
            Year,
            Publisher,
            Pages,
            Identifier,
            GooglebookID,
            ASIN,
            CONCAT('/fictioncovers/', Coverurl) AS Coverurl,
            Extension,
            Filesize,
            Library,
            Issue,
            Locator,
            Commentary,
            Generic,
            Visible,
            TimeAdded,
            TimeLastModified,
            1 as relevance
        FROM
            fiction
        WHERE
            (MATCH (Identifier) AGAINST(:isbn_search_term))
        UNION
        ALL
        SELECT
            ID,
            MD5,
            Title,
            Author,
            Series,
            Edition,
            Language,
            Year,
            Publisher,
            Pages,
            Identifier,
            GooglebookID,
            ASIN,
            CONCAT('/covers/', Coverurl) AS Coverurl,
            Extension,
            Filesize,
            Library,
            Issue,
            Locator,
            Commentary,
            Generic,
            Visible,
            TimeAdded,
            TimeLastModified,
            (
                2.5 * (
                    MATCH(series) AGAINST (:ordered_search_term IN BOOLEAN MODE)
                ) + 1.3 * (
                    MATCH(series) AGAINST (:search_term IN BOOLEAN MODE)
                ) + (
                    2.2 * (
                        MATCH(title) AGAINST (:ordered_search_term IN BOOLEAN MODE)
                    )
                ) + (
                    1 * (
                        MATCH(title) AGAINST (:search_term IN BOOLEAN MODE)
                    )
                ) + (
                    1.8 * (
                        MATCH(author) AGAINST (:ordered_search_term IN BOOLEAN MODE)
                    )
                ) + (
                    0.6 * (
                        MATCH(author) AGAINST (:search_term IN BOOLEAN MODE)
                    )
                )
            ) AS relevance
        FROM
            updated
        WHERE
            (
                MATCH(
                    Title,
                    Author,
                    Series,
                    Publisher,
                    Year,
                    Periodical,
                    VolumeInfo
                ) AGAINST (:search_term IN BOOLEAN MODE)
            )
        UNION
        ALL
        SELECT
            ID,
            MD5,
            Title,
            Author,
            Series,
            Edition,
            Language,
            Year,
            Publisher,
            Pages,
            Identifier,
            GooglebookID,
            ASIN,
            CONCAT('/covers/', Coverurl) AS Coverurl,
            Extension,
            Filesize,
            Library,
            Issue,
            Locator,
            Commentary,
            Generic,
            Visible,
            TimeAdded,
            TimeLastModified,
            1 as relevance
        FROM
            updated
        WHERE
            (
                MATCH (IdentifierWODash) AGAINST(:isbn_search_term)
            )
    ) combinedquery
WHERE
    Extension IN(:extensions)
    AND Visible <> 'no'
    AND (
        CASE
            WHEN :language <> '' THEN Language = :language
            ELSE true
        END
    )
ORDER BY
    relevance DESC
LIMIT
    :limit OFFSET :offset;