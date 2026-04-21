import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";
import { getSessionOrFail } from "@/util/permission"
import { resolveTenant } from "@/lib/tenant"
import { getTenantPrisma } from "@/lib/prisma-tenant";

// CREATE

/* 

export async function POST(req: NextRequest) {
  // a unica tenant que pode criar empresas é a master, ou seja a empresa primaria do sistema, que 
  // tem acesso a tudo. Isso é controlado pelo getSessionOrFail, que verifica se o usuário tem a role "GOD"
  const session = await getSessionOrFail(["GOD"])

  if(!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const body = await req.json()

    const empresa = await prisma.empresa.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj,
        setores: body.setores || [],
        databaseUrl: 'postgresql://user:password@host:port/dbname', // Placeholder, deve ser gerada dinamicamente
      },
    })

    return NextResponse.json(empresa)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao criar empresa" },
      { status: 500 }
    )
  }
}
 */

// /src/app/api/admin/empresa/route.ts



export async function POST(req: NextRequest) {
  // ================= AUTH =================
  // apenas usuários GOD podem acessar
  const session = await getSessionOrFail(["GOD"])

  if (!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  // ================= TENANT CHECK =================
  // garante que quem está chamando é o tenant master // vamos usar dev-testes por enquanto
  const tenant = await resolveTenant()

  if (tenant.slug !== "dev-testes") {
    return NextResponse.json(
      { error: "Apenas o tenant master pode criar empresas" },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()

    const { nome, cnpj, setores, databaseUrl } = body

    // ================= VALIDAÇÃO =================
    if (!nome || !cnpj) {
      return NextResponse.json(
        { error: "Nome e CNPJ são obrigatórios" },
        { status: 400 }
      )
    }

    if (!databaseUrl) {
      return NextResponse.json(
        { error: "databaseUrl é obrigatória" },
        { status: 400 }
      )
    }

    // ================= SLUG =================
    // gera slug padronizado para subdomínio
    const slug = nome
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")

    // ================= DUPLICIDADE =================
    const empresaExistente = await prisma.empresa.findFirst({
      where: {
        OR: [
          { nome },
          { cnpj },
          // importante: quando adicionar campo slug no schema
          // { slug }
        ],
      },
    })

    if (empresaExistente) {
      return NextResponse.json(
        { error: "Empresa já cadastrada" },
        { status: 400 }
      )
    }

    // ================= TESTE DE CONEXÃO =================
   /* 
    try {
      const tenantPrisma = getTenantPrisma(databaseUrl)

      // query simples só pra validar conexão
      await tenantPrisma.$queryRaw`SELECT 1`
    } catch (err) {
      console.error("Erro ao conectar no banco do tenant:", err)

      return NextResponse.json(
        { error: "Não foi possível conectar ao banco informado" },
        { status: 400 }
      )
    }

 */
    // ================= CREATE =================
    const empresa = await prisma.empresa.create({
      data: {
        nome,
        cnpj,
        setores: setores || [],
        databaseUrl,
        // quando adicionar no schema:
        // slug,
      },
    })

    return NextResponse.json(empresa, { status: 201 })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao criar empresa" },
      { status: 500 }
    )
  }
}
// READ ALL / READ BY CNPJ
export async function GET(request: Request) {
 const session = await getSessionOrFail(["GOD"])


  if(!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
console.log('rota de empresas precisa configurar para colocar o banco de dados via front end')
  try {
    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get("cnpj")

    if (!cnpj) {
      const empresas = await prisma.empresa.findMany({
        select: {
          id: true,
          nome: true,
          cnpj: true,
          setores: true,
          databaseUrl: true,
        },
      })

      return NextResponse.json(empresas)
    }

    const empresa = await prisma.empresa.findUnique({
      where: { cnpj },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        setores: true,
        databaseUrl: true,
      },
    })

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(empresa)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao buscar empresa" },
      { status: 500 }
    )
  }
}