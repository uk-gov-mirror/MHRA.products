use crate::{pagination, pagination::PageInfo, product::Product};

#[derive(juniper::GraphQLObject)]
#[graphql(description = "An active ingredient found in medical products")]
pub struct Substance {
    name: String,
    products: Option<Vec<Product>>,
}

impl Substance {
    pub fn new(name: String, products: Option<Vec<Product>>) -> Self {
        Self { name, products }
    }

    #[allow(dead_code)]
    fn name(&self) -> &str {
        &self.name
    }
}

pagination! {Substances, SubstanceEdge, Substance}

pub async fn get_substances(first: i32) -> Substances {
    let substances: [&str; 1000] = ["Ibuprofen"; 1000];
    let edges = substances
        .iter()
        .take(first as usize)
        .map(|&x| Substance::new(x.to_string(), Some(vec![])))
        .map(|y| SubstanceEdge {
            node: y,
            cursor: "cursor".to_owned(),
        })
        .collect();

    Substances {
        edges,
        total_count: 1000,
        page_info: PageInfo {
            has_previous_page: false,
            has_next_page: first < 1000,
            start_cursor: "start cursor here".to_string(),
            end_cursor: "end cursor here".to_string(),
        },
    }
}
