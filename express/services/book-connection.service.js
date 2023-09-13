class BookConnection {
    constructor() {
        if (
            !this.getBooksToRead
        ) {
            throw new Error('Implementation is missing functions!');
        }
    }


}

module.exports =  BookConnection;