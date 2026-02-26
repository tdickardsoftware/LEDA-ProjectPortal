/**
 * Font configuration — defines the Inter and Lusitana Google Font instances
 * used throughout the application. Inter is the primary UI font; Lusitana
 * is used for branded display text such as the DartLogo component.
 */
import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin']});

export const lusitana = Lusitana({
    weight: ['400', '700'],
    subsets: ['latin']
});