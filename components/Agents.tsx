import { Span } from 'next/dist/trace';
import Image from 'next/image'
import React from 'react'

const Agents = () => {

    const isSpeaking=true;

  return (
    <div className='call-view'>
        <div className='card-interviewer'>
            <div className='avatar'>
                <Image src="/ai-avatar.png" alt='vapi' width={65} height={54} className='object-cover'/>
                {isSpeaking && <span className='animate-speak'/>}
            </div>
        </div>
    </div>
  )
}

export default Agents