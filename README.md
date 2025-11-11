# Pokédex Integrada

Imagine ter uma Pokédex em português, bonita e simples de usar, que traz informações oficiais direto da PokéAPI. Este projeto entrega exatamente isso: uma experiência web onde você pode navegar pelos Pokémons, filtrar por tipo, fazer login e montar sua coleção virtual.

## Por que você vai gostar

- Visual limpo inspirado na Pokédex clássica.
- Lista sempre atualizada com nome, imagem, tipos e descrição rápida.
- Filtro por tipo para encontrar rapidamente seu Pokémon favorito.
- Botão “Capturar” para guardar seus preferidos e acompanhar tudo na sua conta.
- Cadastro e login simples, com histórico de capturas salvo para você.

## Como começar

### Se recebeu um link pronto
1. Abra o link no seu navegador preferido (Chrome, Firefox, Edge ou Safari).
2. Crie sua conta na própria tela inicial ou entre com seu e-mail e senha.
3. Explore, filtre, capture e veja sua coleção crescer na aba “Meus Pokémons”.

### Se recebeu os arquivos para rodar no computador
1. Peça (ou confira) o arquivo `docker-compose.yml` que acompanha o projeto.
2. Instale o Docker Desktop (ou Docker Engine, se já usa Linux).
3. No terminal, vá até a pasta enviada e execute `docker compose up`.
4. Aguarde o carregamento inicial (o sistema busca os Pokémons automaticamente).
5. Acesse `http://localhost:3000` no navegador para usar a Pokédex.

Se preferir, alguém com familiaridade técnica pode publicar o app em um serviço de hospedagem e compartilhar o link com você.

## Dicas de uso

- Use o campo de filtro para descobrir Pokémons por tipo (fogo, água, planta, etc.).
- Clique em “Capturar” para salvar um Pokémon na sua conta; ele aparece na aba de capturas.
- Caso o sistema peça login novamente, é só inserir e-mail e senha que você cadastrou.
- Se tiver dificuldades de acesso, atualize a página ou verifique se a conexão com a internet está estável.

## Perguntas frequentes

**Preciso pagar algo?**  
Não! A Pokédex é totalmente gratuita.

**Funciona no celular?**  
Sim, a página se adapta a telas menores. Para uma experiência completa, recomendamos usar o modo paisagem.

**Perdi minha senha. E agora?**  
Entre em contato com a pessoa ou equipe que disponibilizou a Pokédex para você; eles vão ajudar a redefinir a senha.

**Preciso instalar alguma coisa além do navegador?**  
Se você acessar via link, não. Caso esteja rodando nos arquivos, precisa apenas do Docker (ou de alguém para configurar por você).

## Bastidores, caso tenha curiosidade

- A Pokédex usa a PokéAPI oficial, garantindo dados confiáveis.
- O backend foi construído em Flask (Python) e armazena informações em PostgreSQL.
- O site é feito com HTML, CSS e JavaScript puro, garantindo rapidez e compatibilidade.

Pronto! Agora é só aproveitar a jornada e montar sua equipe dos sonhos. Em caso de dúvidas ou sugestões, fale com quem compartilhou o projeto com você — adoramos receber feedback.