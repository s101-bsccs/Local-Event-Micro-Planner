function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    joinedDate: user.joinedDate.toISOString(),
    preferences: user.preferences
  };
}

function serializeBook(book) {
  return {
    id: book._id.toString(),
    title: book.title,
    titleMarathi: book.titleMarathi,
    author: book.author,
    authorId: book.authorId,
    description: book.description,
    longDescription: book.longDescription,
    coverImage: book.coverImage,
    rating: book.rating,
    totalRatings: book.totalRatings,
    genre: book.genre,
    publishYear: book.publishYear,
    publisher: book.publisher,
    language: book.language,
    pages: book.pages,
    isbn: book.isbn,
    edition: book.edition,
    awards: book.awards,
    formats: book.formats,
    price: book.price,
    availability: book.availability,
    tags: book.tags,
    pdfUrl: book.pdfUrl,
    pdfLocalPath: book.pdfLocalPath,
    downloadCount: book.downloadCount,
    views: book.views,
    source: book.source,
    license: book.license
  };
}

function serializeReview(review) {
  return {
    id: review._id.toString(),
    bookId: review.bookId.toString(),
    userId: review.userId ? review.userId.toString() : '',
    userName: review.userName,
    userAvatar: review.userAvatar,
    rating: review.rating,
    comment: review.comment,
    date: review.createdAt.toISOString(),
    likes: review.likes,
    likedByUser: false,
    status: review.status
  };
}

function serializeQuote(quote) {
  return {
    id: quote._id.toString(),
    text: quote.text,
    author: quote.author,
    bookId: quote.bookId || undefined,
    bookTitle: quote.bookTitle,
    category: quote.category,
    tags: quote.tags,
    likes: quote.likes,
    language: quote.language
  };
}

function serializeProgress(progress) {
  return {
    bookId: progress.bookId.toString(),
    bookTitle: progress.bookTitle,
    bookAuthor: progress.bookAuthor,
    bookCover: progress.bookCover,
    currentPage: progress.currentPage,
    totalPages: progress.totalPages,
    startDate: progress.startDate.toISOString(),
    lastReadDate: progress.lastReadDate.toISOString(),
    completedDate: progress.completedDate ? progress.completedDate.toISOString() : undefined,
    status: progress.status,
    notes: progress.notes,
    highlights: progress.highlights.map((highlight) => ({
      id: highlight._id.toString(),
      page: highlight.page,
      text: highlight.text,
      note: highlight.note,
      color: highlight.color,
      date: highlight.date.toISOString()
    }))
  };
}

function serializeGoal(goal) {
  return {
    id: goal._id.toString(),
    title: goal.title,
    target: goal.target,
    achieved: goal.achieved,
    unit: goal.unit,
    startDate: goal.startDate.toISOString(),
    endDate: goal.endDate.toISOString(),
    status: goal.status
  };
}

module.exports = {
  serializeBook,
  serializeGoal,
  serializeProgress,
  serializeQuote,
  serializeReview,
  serializeUser
};
