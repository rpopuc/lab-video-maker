const imageDownloader = require('image-downloader')
const gm = require('gm').subClass({imageMagick: true})
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const googleSearchCredentials = require('./credentials/google-search.json')

async function execute(query) {
    console.log("> [image-robot] Starting...")

    // Obtém as urls das imagens relacionadas ao termo
    // e às sentenças
    let images = await fetchGoogleAndReturnImagesLinks(query)

    // Efetua o download das imagens obtidas
    await downloadAllImages(images)

    // Salva a estrutura em disco
    //state.save(content)

    // Executa a busca do google e obtém uma lista
    // de imagens a partir do termo indicado em `query`
    async function fetchGoogleAndReturnImagesLinks(query) {
        // Executa a consulta pela api do google
        const response = await customSearch.cse.list({
            // Chave de autenticação
            auth: googleSearchCredentials.apiKey,

            // Contexto da busca
            cx: googleSearchCredentials.searchEngineId,

            // Tipo de conteúdo buscado
            searchType: 'image',

            // Tamanho da imagem desejado
            imgSize: 'huge', // enorme

            // Texto de consulta
            q: query,

            // Limite de resultados esperado
            num: 10,
        })

        // Retorna apenas os links de cada um dos items
        return response.data.items.map(item => item.link)
    }

    // Função para baixar todas as imagens encontradas
    // com a google search api
    async function downloadAllImages(images) {
        let downloadedImages = []

        for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
            // Obtém a url da imagem
            const imageUrl = images[imageIndex]

            // Tenta efetuar o download da imagem
            try {
                // Se a imagem já foi baixada anteriormente, ignore
                if (downloadedImages.includes(imageUrl)) {
                    throw new Error('Imagem already downloaded')
                }

                // Efetua o download da imagem e a salva em disco
                await downloadAndSave(imageUrl, `${imageIndex}-original.png`)

                // Adiciona a url da imagem à lista de imagens baixadas
                downloadedImages.push(imageUrl)

                console.log(`> [image-robot] [${imageIndex}] Image successfully downloaded: ${imageUrl}`)
            } catch (error) {
                console.log(`> [image-robot] [${imageIndex}] Error on ${imageUrl}> ${error}`)
            }
        }
    }

    // Função para baixar a imagem da url e a salvar no arquivo
    // indicado
    async function downloadAndSave(url, fileName) {
        // Com uso do ImageDownloader
        return imageDownloader.image({
            // Obtém a imagem da url
            url,

            // E a salva no arquivo de destino
            dest: `./content/${fileName}`,
        })
    }

    return images
}

images = execute(process.argv[2]).then(
    images => console.log(images)
)
