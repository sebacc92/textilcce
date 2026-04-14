import { component$ } from '@builder.io/qwik';
import post1Img from '~/media/Fotos/1.jpeg';
import post8Img from '~/media/Fotos/8.jpeg';
import post3Img from '~/media/Fotos/3.jpeg';
import post9Img from '~/media/Fotos/9.jpeg';
import post10Img from '~/media/Fotos/10.jpeg';
import post6Img from '~/media/Fotos/6.jpeg';

export interface InstagramPostProps {
  id: string;
  imageUrl: string;
  link: string;
  caption?: string;
  likes?: number;
}

export const MOCK_INSTAGRAM_POSTS: InstagramPostProps[] = [
  {
    id: 'post-1',
    imageUrl: post1Img,
    link: 'https://instagram.com/textil_cce',
    likes: 342,
    caption: 'Nuevo ingreso de Gabardina 8oz.',
  },
  {
    id: 'post-2',
    imageUrl: post8Img,
    link: 'https://instagram.com/textil_cce',
    likes: 512,
    caption: 'Stock renovado en Batista Blanca.',
  },
  {
    id: 'post-3',
    imageUrl: post3Img,
    link: 'https://instagram.com/textil_cce',
    likes: 289,
    caption: 'Preparando pedidos para el interior.',
  },
  {
    id: 'post-4',
    imageUrl: post9Img,
    link: 'https://instagram.com/textil_cce',
    likes: 876,
    caption: 'Telas por rollo al mejor precio.',
  },
  {
    id: 'post-5',
    imageUrl: post10Img,
    link: 'https://instagram.com/textil_cce',
    likes: 120,
    caption: 'Variedad de colores para confección.',
  },
  {
    id: 'post-6',
    imageUrl: post6Img,
    link: 'https://instagram.com/textil_cce',
    likes: 450,
    caption: 'Atención especial para talleres.',
  },
];

type SocialFeedProps = {
  posts?: InstagramPostProps[];
};

export const SocialFeed = component$<SocialFeedProps>(({ posts }) => {
  const safePosts = posts && posts.length > 0 ? posts : MOCK_INSTAGRAM_POSTS;

  return (
    <section class="relative py-20 bg-black text-white border-y border-white/10">

      <div class="mx-auto flex max-w-7xl flex-col gap-10 px-4">
        <header class="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div class="text-center md:text-left">
            <p class="mb-2 text-xs font-bold tracking-[0.35em] text-zinc-400">
              TELAS MAYORISTAS · ONCE · ENVÍOS
            </p>
            <h2 class="text-3xl font-black uppercase leading-tight tracking-[0.25em] md:text-4xl text-white">
              @textil_cce
            </h2>
          </div>

          <a
            href="https://instagram.com/textil_cce"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 border border-white bg-white text-black px-6 py-3 text-xs font-black uppercase tracking-[0.25em] transition hover:-translate-y-0.5 hover:bg-gray-200"
          >
            <span>Ver perfil</span>
          </a>
        </header>

        <div class="grid grid-cols-2 gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4 xl:grid-cols-6">
          {safePosts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              class="group relative block aspect-square overflow-hidden bg-zinc-900"
            >
              <img
                src={post.imageUrl}
                alt={post.caption || 'Post de Instagram de Textil CCE'}
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div class="flex flex-col items-center gap-2 text-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});
