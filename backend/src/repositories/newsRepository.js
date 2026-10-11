import { initialNews } from '../data.js';

// Array em memória, como no exemplo comentado de Back End/src/server.js.
// A ordem interna é da mais antiga para a mais recente.
// Reiniciar o processo restaura as notícias de exemplo.
const news = [];
for (let i = initialNews.length - 1; i >= 0; i--) {
  news.push(initialNews[i]);
}
let nextId = initialNews.length + 1;

const newsRepository = {
  async findAll() {
    const recentNews = [];
    for (let i = news.length - 1; i >= 0; i--) {
      recentNews.push(news[i]);
    }
    return recentNews;
  },

  async findById(id) {
    for (let i = 0; i < news.length; i++) {
      if (news[i].id === id) return news[i];
    }
    return null;
  },

  async create(values) {
    const item = {
      id: String(nextId),
      title: values.title,
      summary: values.summary,
      category: values.category,
      content: values.content,
      authorId: values.authorId,
      author: values.author,
      createdAt: new Date().toISOString(),
    };
    nextId++;
    news.push(item);
    return item;
  },
};

export default newsRepository;
