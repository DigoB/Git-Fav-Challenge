import { GithubUser } from "./GithubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.loadData()
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    loadData() {

        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []

    }

    async addUser(username) {

        try {

            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists) {
                throw new Error('User already registered')
            }

            const user = await GithubUser.search(username)

            if(user.login === undefined) {
                throw new Error('User not found')
            }

            this.entries = [user, ...this.entries]
            this.update()

            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onAdd()
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
        <td class="user">
            <img src="https://github.com/DigoB.png" alt="Imagem do usuário">
            <a href="#" target="_blank">
                <p>Rodrigo Braz</p>
                <span>DigoB</span>
            </a>
        </td>
        <td class="repositories"></td>
        <td class="followers"></td>
        <td>
            <button class="remove">Remover</button>
        </td>
        `

        return tr
    }

    update() {
        this.removeAllTr()

        this.entries.forEach(user => {
            const row = this.createRow()
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user img').alt = `Image of ${user.name}`
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Are you sure you wish to delete this user?')

                if(isOk) {
                    this.delete(user)
                }
            }


            this.tbody.append(row)
        })
        
    }

    onAdd() {
        const addButton = document.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.addUser(value)
        }
    }

    removeAllTr() {

        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        } )
    }
}