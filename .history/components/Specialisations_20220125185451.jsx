
const callouts = [
    {
      name: 'Desk and Office',
      description: 'Dry needling',
      imageSrc: 'https://ucb56a75a4d13adac3a105b64340.previews.dropboxusercontent.com/p/thumb/ABblUiwlKOK5rmDxeHo-kYIpt-wBfCaOKBMzKKCd-pVv-1fTjEH7xI0ZIiqHj7n0IcVR56742iPI_8Q9zOhAPW-5Jyb34R7ETS7HDUowCKqSf8YAECaF0Rlwa8LrJCzWZM_hOB8esCWHxFQWQ5P3cBJTMdWYH65vM_9_DYW-QH_9_3j5Q2k-EkjsQ5HMH7adxgmTs148vSS0NzfxSzv7jMyhMsyWEIHmeqEUmhQJhFXlRQaRppMm5FuvwMSzYDk5kkSnziTqpMl4qOAM5gEeYefXJdrJDZ832BbvCSiln9NWZJqBRM_l6gfk4MzKbJ2LFjrtW4HRi1nKKIZguvbDdqJnGyrvSHkORH_IphizxdwwcQqaetAp9LY3m8VzrD9xCsw/p.jpeg',
      imageAlt: 'Desk with leather desk pad, walnut desk organizer, wireless keyboard and mouse, and porcelain mug.',
      href: '#',
    },
    {
      name: 'Self-Improvement',
      description: 'Shockwave',
      imageSrc: 'https://uc04f965e698e7fa8a25cd5e3125.previews.dropboxusercontent.com/p/thumb/ABbj6z1hxgqN9_DNFobu0GOflMn9iKZFIRS74QYpiqiHsRCdyuWPZgPZsGiri8SR9ENkBgAk8n3AN0LuQ_FGAyMU5REY6Z-Yeyheb-So7XmvKT7i7m9pqu4egPESrzG07hr3aMM6HNdn6a3q7es29ByV5RkS_banuQlDD2kcrak_CKcy4Orj0jrZB92-ONTPqN5kyGfcGC3aeGVLII-Byqq_XF6SJ6OvOyGh3TVuV6muRHUBLaHiaeUoAwQlIBAKHbGfwaNAypeTRRPOqHKQ3Y-dWOKtAdu4TC9W1jIMez8OTqaqV3rkx6uvgSIw56nktvVXtYOcD2t4aWc3gwPEbNv_1_2bOne1KSQ2WSQa677oORnp5SjtPYkmhOExRUpmryE/p.jpeg',
      imageAlt: 'Wood table with porcelain mug, leather journal, brass pen, leather key ring, and a houseplant.',
      href: '#',
    },
    {
      name: 'Travel',
      description: 'Pilates',
      imageSrc: 'https://ucbe50b3a73d4e1b0953926983f8.previews.dropboxusercontent.com/p/thumb/ABbCdYAN7ddn_EsziYrEx54U76pzc50cJs4bilCniZFzuWLgMflzcJkHgBmz3xg9zZ6tTuTelWdxcHkCHpVOvNoDaLniehMqK198ztHE5B99U9fJws9Byu-WltHjrG10We7_cpLTQ8hHovgZdEmXuQcY1SHOot1swG0MpSUSoC5VSZl9E8ZZ007pBnINabaHM31wtUJSiNqoNY5xhX1OCeFN5e8HVKdGKZ8UzXLzYtxGMLAXEyxsOiOBKhmUxcorXywHddRut_-7FXqivY6ApedljmzVmPPUsevEoxryWT-Uc9kYoZo9ODLIBjaipGewQ_qIRH-A7wn6Noq5AxQ8qfV7L0nfHUUiZ9YDQDZ56YwOZ-gxwsuctATMLE17AmzGzLk/p.jpeg',
      imageAlt: 'Collection of four insulated travel bottles on wooden shelf.',
      href: '#',
    },
  ]
  
  export default function Specialisations() {
    return (
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto py-16 sm:py-24 lg:py-32 lg:max-w-none">
            <h2 className="text-2xl font-extrabold text-gray-900">Specialisaties</h2>
  
            <div className="mt-6 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-6">
              {callouts.map((callout) => (
                <div key={callout.name} className="group relative">
                  <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                    <img
                      src={callout.imageSrc}
                      alt={callout.imageAlt}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>
                  <h3 className="mt-6 text-sm text-gray-500">
                    <a href={callout.href}>
                      <span className="absolute inset-0" />
                      {callout.name}
                    </a>
                  </h3>
                  <p className="text-base font-semibold text-gray-900">{callout.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  