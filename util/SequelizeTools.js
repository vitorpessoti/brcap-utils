module.exports = {
  /**
 * Paginação para Sequelize (raw = true, forçado)
 * @param {object} model    Model Sequelize
 * @param {object} options  Sequilize Options
 * @param {number} limit    Limite de resultados por pagina
 * @param {number} page     Pagina desejada, se null === 1
 * @param {object} [req]    Opcional, objeto req do Express, se informado retorna currentPageLink, nextPagelink, previousPageLink
 * @returns {Promise}
 */
  paginate: (model, options, limit, page, req) => new Promise((resolve, reject) => {
    (async () => {
      try {
        let currentPage = page && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
        const offset = currentPage * limit - limit;
        Object.assign(options, {
          raw: true,
          limit,
          offset,
        });
        const success = await model.findAndCountAll(options);
        const totalPages = Math.ceil(success.count / limit);
        currentPage = currentPage >= totalPages ? totalPages : currentPage;
        const nextPage = currentPage + 1 <= totalPages ? currentPage + 1 : totalPages;
        const previousPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
        let currentPageLink;
        let nextPageLink;
        let previousPageLink;
        if (req) {
          const requestedUrl = `${req.protocol}://${req.get('Host')}${req.url}`;
          currentPageLink = requestedUrl;
          if (!/page=/g.test(requestedUrl)) currentPageLink += `page=${currentPage}`;
          currentPageLink = currentPageLink.replace(/page=[\d]+/g, `page=${currentPage}`);
          nextPageLink = currentPageLink.replace(/page=[\d]+/g, `page=${nextPage}`);
          previousPageLink = currentPageLink.replace(/page=[\d]+/g, `page=${previousPage}`);
        }
        Object.assign(success, {
          total: success.count,
          totalPages,
          currentPage,
          nextPage,
          previousPage,
          currentPageLink,
          nextPageLink,
          previousPageLink,
        });
        delete (success.count);
        if (currentPage === nextPage) {
          delete (success.nextPage);
          delete (success.nextPageLink);
        }
        if (currentPage === previousPage) {
          delete (success.previousPage);
          delete (success.previousPageLink);
        }
        resolve(success);
      } catch (error) {
        reject(error);
      }
    })();
  }),
};
