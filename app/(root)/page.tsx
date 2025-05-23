import CategoryFilter from '@/components/shared/CategoryFilter';
import Collection from '@/components/shared/Collection'
import Search from '@/components/shared/Search';
import { Button } from '@/components/ui/button'
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import Image from 'next/image'
import Link from 'next/link'


export default async function Home({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || '';
  const category = (searchParams?.category as string) || '';

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 6
  })

  return (
    <>
      <section className="bg-gradient-to-r from-primary-50 to-purple-50 bg-dotted-pattern bg-contain py-5 md:py-10">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-8 slide-in">
            <h1 className="h1-bold gradient-text">
              Host, Connect, Celebrate: Your Events, Our Platform!
            </h1>
            <p className="p-regular-20 md:p-regular-24 fade-in" style={{animationDelay: '0.3s'}}>
              Book and learn helpful tips from 3,168+ mentors in world-class companies with our global community.
            </p>
            <div className="bounce-in" style={{animationDelay: '0.6s'}}>
              <Button size="lg" asChild className="button w-full bg-gradient-to-r from-primary-500 to-purple-500 sm:w-fit hover-scale card-shine">
                <Link href="#events">
                  Explore Now
                </Link>
              </Button>
            </div>
          </div>

          <div className="fade-in" style={{animationDelay: '0.9s'}}>
            <Image 
              src="/assets/images/hero.png"
              alt="hero"
              width={1000}
              height={1000}
              className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh] hover-scale"
            />
          </div>
        </div>
      </section> 

      <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <div className="fade-in">
          <h2 className="h2-bold text-center gradient-text">
            Trusted by Thousands of Events
          </h2>
        </div>

        <div className="flex w-full flex-col gap-5 md:flex-row slide-in">
          <Search />
          <CategoryFilter />
        </div>

        <div className="fade-in" style={{animationDelay: '0.3s'}}>
          <Collection 
            data={events?.data}
            emptyTitle="No Events Found"
            emptyStateSubtext="Come back later"
            collectionType="All_Events"
            limit={6}
            page={page}
            totalPages={events?.totalPages}
          />
        </div>
      </section>
    </>
  )
}
