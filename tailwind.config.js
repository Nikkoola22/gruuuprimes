/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		animation: {
  			marquee: 'marquee 70s linear infinite',
  			'card-enter-1': 'card-enter 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both',
  			'card-enter-2': 'card-enter 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
  			'card-enter-3': 'card-enter 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both',
  			'cta-enter':    'card-enter 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.38s both',
  			'view-enter':   'view-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
  			'chat-enter':   'view-enter 0.40s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both',
  		},
  		keyframes: {
  			marquee: {
  				'0%': {
  					transform: 'translateX(0%)'
  				},
  				'100%': {
  					transform: 'translateX(-100%)'
  				}
  			},
  			'card-enter': {
  				'0%':   { opacity: '0', transform: 'translate3d(0, 28px, 0) scale(0.96)' },
  				'100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
  			},
  			'view-enter': {
  				'0%':   { opacity: '0', transform: 'translate3d(0, 14px, 0) scale(0.99)' },
  				'100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
  			},
  		},
  		animationPlayState: {
  			pause: 'paused'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  // On ajoute le plugin pour les variantes 'group-hover'
  plugins: [
    function ({ addVariant }) {
      addVariant('group-hover', '.group:hover &');
    },
      require("tailwindcss-animate")
],
};
