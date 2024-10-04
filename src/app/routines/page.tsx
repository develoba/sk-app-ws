import React from 'react'
import supabase from '../utils/supabase';
import Link from 'next/link';
import Image from 'next/image';

enum RoutineCategory {
    guias = 'guias',
    retos = 'retos'
}

interface UserRoutine {
    id: number,
    user_id: number,
    routine_category: number,
    routine_id: string
}

interface Routine {
    routine_id: string;
    name: string;
    main_img_url: string;
    duration: string;
    location: string;
    price: number;
    total_days: number;
    completed_days: number;
    total_exercises: number;
    total_sets: number;
    muscles: string;
    instructions: string;
    category: string;
    goal: string;
    muscle: string;
    level: string;
}

export default async function RoutinesPage() {
    const userRoutinesCategorized: Map<RoutineCategory, Array<{ userRoutine: UserRoutine, routine: Routine }>> = new Map();

    try {

        const [userRoutines, routines] = await Promise.all([
            supabase.from('user_routines').select(),
            supabase.from('routines').select(),
        ])

        if (userRoutines.error) throw userRoutines.error;
        if (routines.error) throw routines.error;

        const userRoutinesData: UserRoutine[] = userRoutines.data ?? [];
        const routinesData: Routine[] = routines.data ?? [];

        // Filter userRoutines by user_id
        const individualUserRoutines = userRoutinesData.filter((userRoutine) => userRoutine.user_id === 1)

        // Group routines ids according to their catgory

        for (const userRoutine of individualUserRoutines) {

            // get corresponding Routine for UserRoutine:
            const routine = routinesData.find((r) => r.routine_id == userRoutine.routine_id)

            if (!routine) {
                console.log(`no routine ${userRoutine.routine_id} for user`)
                continue;
            }

            const category: RoutineCategory = Object.values(RoutineCategory)[userRoutine.routine_category] as RoutineCategory

            if (userRoutinesCategorized.has(category)) {
                const routinesList = userRoutinesCategorized.get(category)
                routinesList?.push({ userRoutine, routine })
            } else {
                userRoutinesCategorized.set(category, [{ userRoutine, routine }])
            }
        }

    } catch (error) {
        console.log('Error fetching data: ', error);
    }


    return <div className='flex flex-col'>
        {/* Header */}
        <div className='bg-gray-800 py-5 text-center mb-5'>
            <p className='font-bold text-2xl'>SK Workout</p>
        </div>

        {/* List of routines */}
        <div className='flex flex-col gap-4 px-8 relative'>
            {Array.from(userRoutinesCategorized).map(([key, value]) => (
                <div key={key}>
                    <h1>{key.toString().toUpperCase()}</h1>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {value.map(({ userRoutine, routine }) => (
                            <div
                                key={userRoutine.id}
                                className='w-full overflow-hidden relative rounded-md'
                            >
                                <Link
                                    href={'/routines/[id]'}
                                    as={`routines/${routine.routine_id}`}
                                >
                                    <div className='h-72'>
                                        <Image
                                            src={routine.main_img_url}
                                            alt={routine.name}
                                            fill={true}
                                            objectFit='cover'
                                        />
                                        <div className='absolute inset-0 bg-gray-800 bg-opacity-50'></div>
                                    </div>

                                    <div className='absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-gray-700 to-transparent'>
                                        <p className='text-xl font-bold'>{routine.name}</p>
                                    </div>

                                </Link>
                            </div>

                        ))}
                    </div>


                </div>
            ))}
            {/*(routines?.map((routine) => (
                <Link
                    href={'/routines/[id]'}
                    as={`routines/${routine.routine_id}`}
                    key={routine.routine_id}
                    className='w-full overflow-hidden relative'
                >
                    <div className='h-72'>
                        <Image
                            src={routine.main_img_url}
                            alt={routine.name}
                            fill={true}
                            objectFit='cover'
                        />
                        <div className='absolute inset-0 bg-gray-800 bg-opacity-50'></div>
                    </div>

                    <div className='absolute inset-0 p-2 flex flex-col justify-end bg-gradient-to-t from-gray-700 to-transparent'>
                        <p className='text-xl font-bold'>{routine.name}</p>
                    </div>

                </Link>
            ))
            )*/}
        </div>

    </div>
}